import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { RegisterAffiliateDto } from './dto/register-affiliate.dto';

@Injectable()
export class AffiliatesService {
  constructor(private prisma: PrismaService) {}

  async registerAffiliate(userId: string, registerAffiliateDto: RegisterAffiliateDto) {
    const existing = await this.prisma.affiliate.findUnique({ where: { userId } });
    if (existing) {
      throw new BadRequestException('User is already an affiliate');
    }

    const trackingCode = this.generateTrackingCode();

    const affiliate = await this.prisma.affiliate.create({
      data: {
        userId,
        commissionType: registerAffiliateDto.commissionType,
        commissionRate: registerAffiliateDto.commissionRate,
        trackingCode,
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { affiliateId: affiliate.id },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    return {
      affiliateId: affiliate.id,
      trackingCode,
      referralLink: `${frontendUrl}/register?ref=${trackingCode}`,
      commissionType: affiliate.commissionType,
      commissionRate: affiliate.commissionRate,
    };
  }

  async getDashboard(userId: string) {
    const affiliate = await this.prisma.affiliate.findUnique({
      where: { userId },
    });

    if (!affiliate) {
      throw new NotFoundException('Not an affiliate');
    }

    const referrals = await this.prisma.user.count({
      where: { referredById: userId },
    });

    const activeReferrals = await this.prisma.user.count({
      where: {
        referredById: userId,
        isActive: true,
        isBanned: false,
      },
    });

    const commissions = await this.prisma.affiliateCommission.groupBy({
      by: ['status'],
      where: { affiliateId: affiliate.id },
      _sum: { amount: true },
    });

    const sumBy = (status: string) =>
      Number(commissions.find((c) => c.status === status)?._sum.amount || 0);

    const totalCommission =
      sumBy('PENDING') + sumBy('PAID');
    const pendingCommission = sumBy('PENDING');
    const paidCommission = sumBy('PAID');

    return {
      trackingCode: affiliate.trackingCode,
      commissionType: affiliate.commissionType,
      commissionRate: affiliate.commissionRate,
      totalReferrals: referrals,
      activeReferrals,
      totalCommission,
      pendingCommission,
      paidCommission,
      conversionRate: referrals > 0 ? (activeReferrals / referrals) * 100 : 0,
    };
  }

  async getCommissions(userId: string) {
    const affiliate = await this.prisma.affiliate.findUnique({
      where: { userId },
    });

    if (!affiliate) {
      throw new NotFoundException('Not an affiliate');
    }

    return this.prisma.affiliateCommission.findMany({
      where: { affiliateId: affiliate.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async recordCommission(params: {
    affiliateUserId: string;
    referredUserId: string;
    amount: number;
    source: string;
  }) {
    const affiliate = await this.prisma.affiliate.findUnique({
      where: { userId: params.affiliateUserId },
    });
    if (!affiliate) return null;

    const commissionAmount =
      (Number(params.amount) * Number(affiliate.commissionRate)) / 100;

    if (commissionAmount <= 0) return null;

    return this.prisma.affiliateCommission.create({
      data: {
        affiliateId: affiliate.id,
        referredUserId: params.referredUserId,
        amount: commissionAmount,
        status: 'PENDING',
        source: params.source,
        period: new Date().toISOString().slice(0, 7),
      },
    });
  }

  private generateTrackingCode(): string {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  }
}
