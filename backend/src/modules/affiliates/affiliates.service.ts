import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RegisterAffiliateDto } from './dto/register-affiliate.dto';

@Injectable()
export class AffiliatesService {
  constructor(private prisma: PrismaService) {}

  async registerAffiliate(userId: string, registerAffiliateDto: RegisterAffiliateDto) {
    const trackingCode = this.generateTrackingCode();

    const affiliate = await this.prisma.affiliate.create({
      data: {
        userId,
        commissionType: registerAffiliateDto.commissionType,
        commissionRate: registerAffiliateDto.commissionRate,
        trackingCode,
      },
    });

    // Update user with affiliate ID
    await this.prisma.user.update({
      where: { id: userId },
      data: { affiliateId: affiliate.id },
    });

    return {
      affiliateId: affiliate.id,
      trackingCode,
      referralLink: `https://sorteagora.com/?ref=${trackingCode}`,
    };
  }

  async getDashboard(userId: string) {
    const affiliate = await this.prisma.affiliate.findUnique({
      where: { userId },
    });

    if (!affiliate) {
      throw new Error('Not an affiliate');
    }

    // In production, calculate actual statistics
    return {
      totalReferrals: 0,
      activeReferrals: 0,
      totalCommission: 0,
      pendingCommission: 0,
      paidCommission: 0,
      conversionRate: 0,
    };
  }

  async getCommissions(userId: string) {
    const affiliate = await this.prisma.affiliate.findUnique({
      where: { userId },
    });

    if (!affiliate) {
      throw new Error('Not an affiliate');
    }

    // In production, return actual commission records
    return [];
  }

  private generateTrackingCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }
}
