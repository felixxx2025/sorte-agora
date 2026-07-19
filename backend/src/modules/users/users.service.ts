import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SubmitKycDto } from './dto/submit-kyc.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        country: true,
        currency: true,
        role: true,
        isVerified: true,
        isKycVerified: true,
        mfaEnabled: true,
        vipPoints: true,
        vipLevelId: true,
        account: true,
        createdAt: true,
      },
    });
  }

  async updateProfile(userId: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        country: true,
      },
    });
  }

  async submitKyc(userId: string, dto: SubmitKycDto) {
    const pending = await this.prisma.kyCRecord.findFirst({
      where: { userId, status: 'PENDING' },
    });

    if (pending) {
      throw new BadRequestException('You already have a pending KYC submission');
    }

    return this.prisma.kyCRecord.create({
      data: {
        userId,
        documentType: dto.documentType,
        documentNumber: dto.documentNumber,
        documentFront: dto.documentFront,
        selfie: dto.selfie,
        status: 'PENDING',
      },
    });
  }

  async getKycStatus(userId: string) {
    const latest = await this.prisma.kyCRecord.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isKycVerified: true },
    });

    return {
      isKycVerified: user?.isKycVerified || false,
      latest,
    };
  }
}
