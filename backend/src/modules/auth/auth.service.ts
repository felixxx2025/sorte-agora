import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as QRCode from 'qrcode';
import * as speakeasy from 'speakeasy';

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
  ) { }

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        phone: registerDto.phone,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        referralCode: this.generateReferralCode(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    // Create account
    await this.prisma.account.create({
      data: {
        userId: user.id,
        currency: registerDto.currency || 'BRL',
      },
    });

    return {
      user,
      message: 'Registration successful',
    };
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
    });

    // Update last login
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

    if (!user) {
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

  async refresh(user: any) {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  async logout(user: any, token: string) {
    // Add token to blacklist
    // const expiresIn = 3600; // 1 hour
    // await this.tokenBlacklistService.addToBlacklist(token, expiresIn);

    // Log audit
    // await this.auditService.logAction(user.id, 'LOGOUT', 'USER', { email: user.email });

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

    // await this.auditService.logAction(userId, 'MFA_ENABLED', 'USER');

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

    // await this.auditService.logAction(userId, 'MFA_DISABLED', 'USER');

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
      // Don't reveal if user exists
      return { message: 'If the email exists, a reset link has been sent' };
    }

    const resetToken = this.generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // await this.auditService.logAction(user.id, 'PASSWORD_RESET_REQUESTED', 'USER', { email: user.email });

    // In production, send email with reset link
    console.log(`Password reset link: http://localhost:3000/reset-password?token=${resetToken}`);

    return { message: 'If the email exists, a reset link has been sent' };
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

    // await this.auditService.logAction(user.id, 'PASSWORD_RESET', 'USER');

    return { message: 'Password reset successfully' };
  }

  private generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  private generateResetToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}
