import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import * as QRCode from "qrcode";
import * as speakeasy from "speakeasy";

import { CacheService } from "../../common/services/cache.service";
import { MailService } from "../../common/services/mail.service";
import { TokenBlacklistService } from "../../common/services/token-blacklist.service";
import { PrismaService } from "../../database/prisma.service";
import { EnableMfaDto } from "./dto/enable-mfa.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { RegisterDto } from "./dto/register.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { VerifyMfaDto } from "./dto/verify-mfa.dto";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private tokenBlacklistService: TokenBlacklistService,
    private mailService: MailService,
    private cache: CacheService,
  ) {}

  async register(registerDto: RegisterDto) {
    if (registerDto.dateOfBirth) {
      this.assertAdult(registerDto.dateOfBirth);
    } else {
      throw new BadRequestException("dateOfBirth is required (18+)");
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existing) {
      throw new BadRequestException("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    let referredById: string | undefined;
    if (registerDto.referralCode) {
      const affiliate = await this.prisma.affiliate.findUnique({
        where: { trackingCode: registerDto.referralCode },
      });
      if (affiliate) {
        referredById = affiliate.userId;
      }
    }

    const emailVerificationToken = this.generateResetToken();
    const emailVerificationExpiry = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    );

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        phone: registerDto.phone,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        dateOfBirth: new Date(registerDto.dateOfBirth),
        referralCode: this.generateReferralCode(),
        referredById,
        emailVerificationToken,
        emailVerificationExpiry,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        mfaEnabled: true,
      },
    });

    await this.prisma.account.create({
      data: {
        userId: user.id,
        currency: registerDto.currency || "BRL",
      },
    });

    try {
      const frontendUrl =
        this.configService.get("FRONTEND_URL") || "http://localhost:3000";
      const verifyUrl = `${frontendUrl}/verify-email?token=${emailVerificationToken}`;
      await this.mailService.sendEmailVerification(user.email, verifyUrl);
    } catch {
      // registration must not fail if mail fails
    }

    const tokens = await this.issueTokens(user);

    return {
      ...tokens,
      message: "Registration successful",
    };
  }

  async login(user: any) {
    this.assertAccountUsable(user);

    if (user.mfaEnabled) {
      const mfaToken = this.jwtService.sign(
        { sub: user.id, email: user.email, purpose: "mfa" },
        { expiresIn: "5m" },
      );
      return {
        mfaRequired: true,
        mfaToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      };
    }

    return this.issueTokens(user);
  }

  async completeMfaLogin(mfaToken: string, totp: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(mfaToken);
    } catch {
      throw new UnauthorizedException("Invalid or expired MFA token");
    }

    if (payload.purpose !== "mfa") {
      throw new UnauthorizedException("Invalid MFA token purpose");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.mfaEnabled || !user.mfaSecret) {
      throw new UnauthorizedException("MFA not enabled");
    }

    this.assertAccountUsable(user);

    const isValid = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: "base32",
      token: totp,
      window: 1,
    });

    if (!isValid) {
      throw new BadRequestException("Invalid MFA code");
    }

    return this.issueTokens(user);
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { account: true },
    });

    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    this.assertAccountUsable(user);

    const { password: _, ...result } = user;
    return result;
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token required");
    }

    if (await this.tokenBlacklistService.isBlacklisted(refreshToken)) {
      throw new UnauthorizedException("Token has been revoked");
    }

    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken);
    } catch {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException("User not found or inactive");
    }

    this.assertAccountUsable(user);

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return { accessToken };
  }

  async logout(user: any, token: string) {
    if (token) {
      const expiresIn = this.parseExpirySeconds(
        this.configService.get("JWT_EXPIRES_IN") || "15m",
      );
      await this.tokenBlacklistService.addToBlacklist(token, expiresIn);
    }

    return { message: "Logout successful" };
  }

  async enableMfa(userId: string, enableMfaDto: EnableMfaDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    if (user.mfaEnabled) {
      throw new BadRequestException("MFA is already enabled");
    }

    const pending = await this.cache.getJson<{ secret: string }>(
      `mfa:pending:${userId}`,
    );
    if (!pending?.secret) {
      throw new BadRequestException("Generate MFA secret first");
    }

    const isValid = speakeasy.totp.verify({
      secret: pending.secret,
      encoding: "base32",
      token: enableMfaDto.token,
      window: 1,
    });

    if (!isValid) {
      throw new BadRequestException("Invalid token");
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: true,
        mfaSecret: pending.secret,
      },
    });

    await this.cache.del(`mfa:pending:${userId}`);

    return { message: "MFA enabled successfully" };
  }

  async disableMfa(userId: string, verifyMfaDto: VerifyMfaDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    if (!user.mfaEnabled) {
      throw new BadRequestException("MFA is not enabled");
    }

    const isValid = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: "base32",
      token: verifyMfaDto.token,
      window: 1,
    });

    if (!isValid) {
      throw new BadRequestException("Invalid token");
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: false,
        mfaSecret: null,
      },
    });

    return { message: "MFA disabled successfully" };
  }

  async generateMfaSecret(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    if (user.mfaEnabled) {
      throw new BadRequestException("MFA is already enabled");
    }

    const secret = speakeasy.generateSecret({
      name: `SORTE AGORA (${user.email})`,
    });

    await this.cache.setJson(
      `mfa:pending:${userId}`,
      { secret: secret.base32 },
      600,
    );

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
    };
  }

  async verifyMfa(userId: string, verifyMfaDto: VerifyMfaDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.mfaEnabled) {
      throw new UnauthorizedException("MFA not enabled");
    }

    const isValid = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: "base32",
      token: verifyMfaDto.token,
      window: 1,
    });

    if (!isValid) {
      throw new BadRequestException("Invalid token");
    }

    return { valid: true };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      return { message: "If the email exists, a reset link has been sent" };
    }

    const resetToken = this.generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    const frontendUrl =
      this.configService.get("FRONTEND_URL") || "http://localhost:3000";
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    await this.mailService.sendPasswordReset(user.email, resetUrl);

    return {
      message: "If the email exists, a reset link has been sent",
      ...(this.configService.get("NODE_ENV") !== "production"
        ? { resetToken, resetUrl }
        : {}),
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: resetPasswordDto.token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException("Invalid or expired reset token");
    }

    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 12);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return { message: "Password reset successfully" };
  }

  async verifyEmail(token: string) {
    if (!token) {
      throw new BadRequestException("token is required");
    }

    const user = await this.prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException("Invalid or expired verification token");
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });

    return { message: "Email verified successfully", verified: true };
  }

  async resendVerification(opts: { userId?: string; email?: string }) {
    if (!opts.userId && !opts.email) {
      throw new BadRequestException("email is required when not authenticated");
    }

    let user =
      opts.userId
        ? await this.prisma.user.findUnique({ where: { id: opts.userId } })
        : opts.email
          ? await this.prisma.user.findUnique({ where: { email: opts.email } })
          : null;

    if (!user) {
      if (opts.email && !opts.userId) {
        return {
          message:
            "If the email exists and is unverified, a verification link has been sent",
        };
      }
      throw new BadRequestException("User not found");
    }

    if (user.isVerified) {
      return { message: "Email already verified" };
    }

    const emailVerificationToken = this.generateResetToken();
    const emailVerificationExpiry = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerificationToken, emailVerificationExpiry },
    });

    const frontendUrl =
      this.configService.get("FRONTEND_URL") || "http://localhost:3000";
    const verifyUrl = `${frontendUrl}/verify-email?token=${emailVerificationToken}`;

    try {
      await this.mailService.sendEmailVerification(user.email, verifyUrl);
    } catch {
      // ignore mail errors
    }

    return {
      message: "Verification email sent",
      ...(this.configService.get("NODE_ENV") !== "production"
        ? { emailVerificationToken, verifyUrl }
        : {}),
    };
  }

  private async issueTokens(user: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  }) {
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get("JWT_REFRESH_EXPIRES_IN") || "7d",
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      accessToken,
      refreshToken,
      mfaRequired: false,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  private assertAccountUsable(user: {
    isActive?: boolean;
    isBanned?: boolean;
    deletedAt?: Date | null;
    selfExcludedUntil?: Date | null;
  }) {
    if (!user.isActive || user.isBanned || user.deletedAt) {
      throw new UnauthorizedException("Account is inactive or banned");
    }
    if (user.selfExcludedUntil && user.selfExcludedUntil > new Date()) {
      throw new UnauthorizedException("Self-exclusion active");
    }
  }

  private assertAdult(dateOfBirth: string) {
    const dob = new Date(dateOfBirth);
    if (Number.isNaN(dob.getTime())) {
      throw new BadRequestException("Invalid dateOfBirth");
    }
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
      age -= 1;
    }
    if (age < 18) {
      throw new BadRequestException("You must be 18 or older");
    }
  }

  private generateReferralCode(): string {
    return crypto.randomBytes(4).toString("hex").toUpperCase();
  }

  private generateResetToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  private parseExpirySeconds(expiresIn: string): number {
    const match = /^(\d+)([smhd])$/.exec(expiresIn);
    if (!match) {
      return 3600;
    }
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };
    return value * (multipliers[unit] || 60);
  }
}
