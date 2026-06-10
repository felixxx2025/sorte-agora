import { Injectable } from '@nestjs/common';
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
      throw new Error('Transaction not found');
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
      throw new Error('Transaction not found');
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
    // In production, generate actual reports
    return {
      revenue: 0,
      profit: 0,
      activeUsers: 0,
      newRegistrations: 0,
    };
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
