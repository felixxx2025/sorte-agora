import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BanUserDto } from './dto/ban-user.dto';
import { UpdateBonusDto } from './dto/update-bonus.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const totalUsers = await this.prisma.user.count();
    const totalTransactions = await this.prisma.transaction.count();
    const totalBets = await this.prisma.sportsBet.count();
    const totalSessions = await this.prisma.casinoSession.count();

    return {
      totalUsers,
      totalTransactions,
      totalBets,
      totalSessions,
    };
  }

  async getUsers() {
    return this.prisma.user.findMany({
      include: { account: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async banUser(userId: string, banUserDto: BanUserDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: true,
        banReason: banUserDto.reason,
        bannedAt: new Date(),
      },
    });
  }

  async unbanUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: false,
        banReason: null,
        bannedAt: null,
      },
    });
  }

  async getTransactions() {
    return this.prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async getPendingWithdrawals() {
    return this.prisma.transaction.findMany({
      where: {
        type: 'WITHDRAWAL',
        status: 'PENDING',
      },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async approveWithdrawal(transactionId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { account: true },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // Update transaction status
    await this.prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'COMPLETED',
        processedAt: new Date(),
      },
    });

    // Release locked balance
    await this.prisma.account.update({
      where: { id: transaction.accountId },
      data: {
        lockedBalance: { decrement: transaction.amount },
      },
    });

    return { message: 'Withdrawal approved' };
  }

  async rejectWithdrawal(transactionId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { account: true },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // Update transaction status
    await this.prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'FAILED',
        processedAt: new Date(),
      },
    });

    // Return balance to user
    await this.prisma.account.update({
      where: { id: transaction.accountId },
      data: {
        lockedBalance: { decrement: transaction.amount },
        balance: { increment: transaction.amount },
      },
    });

    return { message: 'Withdrawal rejected' };
  }

  async getReports() {
    const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [deposits, withdrawals, wins, activeUsers, newRegistrations] =
      await Promise.all([
        this.prisma.transaction.aggregate({
          where: { type: 'DEPOSIT', status: 'COMPLETED' },
          _sum: { amount: true },
        }),
        this.prisma.transaction.aggregate({
          where: { type: 'WITHDRAWAL', status: 'COMPLETED' },
          _sum: { amount: true },
        }),
        this.prisma.transaction.aggregate({
          where: { type: 'WIN', status: 'COMPLETED' },
          _sum: { amount: true },
        }),
        this.prisma.user.count({
          where: {
            isActive: true,
            isBanned: false,
            lastLoginAt: { gte: since30d },
          },
        }),
        this.prisma.user.count({
          where: { createdAt: { gte: since30d } },
        }),
      ]);

    const revenue = Number(deposits._sum.amount || 0);
    const withdrawn = Number(withdrawals._sum.amount || 0);
    const paidWins = Number(wins._sum.amount || 0);
    const profit = revenue - withdrawn - paidWins;

    return {
      revenue,
      profit,
      withdrawn,
      paidWins,
      activeUsers,
      newRegistrations,
      periodDays: 30,
    };
  }

  async listPendingKyc() {
    return this.prisma.kyCRecord.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async reviewKyc(kycId: string, decision: 'APPROVED' | 'REJECTED', adminId: string, reason?: string) {
    const record = await this.prisma.kyCRecord.findUnique({ where: { id: kycId } });
    if (!record) {
      throw new NotFoundException('KYC record not found');
    }

    await this.prisma.kyCRecord.update({
      where: { id: kycId },
      data: {
        status: decision,
        reviewedAt: new Date(),
        reviewedBy: adminId,
        rejectionReason: decision === 'REJECTED' ? reason || 'Rejected' : null,
      },
    });

    if (decision === 'APPROVED') {
      await this.prisma.user.update({
        where: { id: record.userId },
        data: { isKycVerified: true, isVerified: true },
      });
    }

    return { message: `KYC ${decision.toLowerCase()}` };
  }

  async settleSportsBet(betId: string, result: 'WON' | 'LOST') {
    // Delegated via SportsService in controller — kept for compatibility if needed
    return { betId, result };
  }

  async createBonus(createBonusDto: any) {
    return this.prisma.bonus.create({
      data: createBonusDto,
    });
  }

  async updateBonus(bonusId: string, updateBonusDto: UpdateBonusDto) {
    return this.prisma.bonus.update({
      where: { id: bonusId },
      data: updateBonusDto,
    });
  }

  async deleteBonus(bonusId: string) {
    return this.prisma.bonus.delete({
      where: { id: bonusId },
    });
  }
}
