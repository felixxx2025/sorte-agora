import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as QRCode from 'qrcode';
import * as speakeasy from 'speakeasy';

import { MailService } from '../../common/services/mail.service';
import { TokenBlacklistService } from '../../common/services/token-blacklist.service';
import { PrismaService } from '../../database/prisma.service';
import { EnableMfaDto } from './dto/enable-mfa.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyMfaDto } from './dto/verify-mfa.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private tokenBlacklistService: TokenBlacklistService,
    private mailService: MailService,
  ) { }

  async register(registerDto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existing) {
      throw new BadRequestException('Email already registered');
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

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        phone: registerDto.phone,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        referralCode: this.generateReferralCode(),
        referredById,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    await this.prisma.account.create({
      data: {
        userId: user.id,
        currency: registerDto.currency || 'BRL',
      },
    });

    const tokens = await this.login(user);

    return {
      ...tokens,
      message: 'Registration successful',
    };
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d',
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
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

    if (!user.isActive || user.isBanned) {
      throw new UnauthorizedException('Account is inactive or banned');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token required');
    }

    if (await this.tokenBlacklistService.isBlacklisted(refreshToken)) {
      throw new UnauthorizedException('Token has been revoked');
    }

    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive || user.isBanned) {
      throw new UnauthorizedException('User not found or inactive');
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return { accessToken };
  }

  async logout(user: any, token: string) {
    if (token) {
      const expiresIn = this.parseExpirySeconds(
        this.configService.get('JWT_EXPIRES_IN') || '15m',
      );
      await this.tokenBlacklistService.addToBlacklist(token, expiresIn);
    }

    return { message: 'Logout successful' };
  }

  async enableMfa(userId: string, enableMfaDto: EnableMfaDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.mfaEnabled) {
      throw new BadRequestException('MFA is already enabled');
    }

    const secret = speakeasy.generateSecret({
      name: `SORTE AGORA (${user.email})`,
    });

    const isValid = speakeasy.totp.verify({
      secret: secret.base32,
      encoding: 'base32',
      token: enableMfaDto.token,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid token');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: true,
        mfaSecret: secret.base32,
      },
    });

    return { message: 'MFA enabled successfully' };
  }

  async disableMfa(userId: string, verifyMfaDto: VerifyMfaDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.mfaEnabled) {
      throw new BadRequestException('MFA is not enabled');
    }

    const isValid = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: verifyMfaDto.token,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid token');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: false,
        mfaSecret: null,
      },
    });

    return { message: 'MFA disabled successfully' };
  }

  async generateMfaSecret(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.mfaEnabled) {
      throw new BadRequestException('MFA is already enabled');
    }

    const secret = speakeasy.generateSecret({
      name: `SORTE AGORA (${user.email})`,
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

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
      throw new UnauthorizedException('MFA not enabled');
    }

    const isValid = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: verifyMfaDto.token,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid token');
    }

    return { valid: true };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      return { message: 'If the email exists, a reset link has been sent' };
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

    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    await this.mailService.sendPasswordReset(user.email, resetUrl);

    return {
      message: 'If the email exists, a reset link has been sent',
      ...(this.configService.get('NODE_ENV') !== 'production'
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
      throw new BadRequestException('Invalid or expired reset token');
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

    return { message: 'Password reset successfully' };
  }

  private generateReferralCode(): string {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  private generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
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
