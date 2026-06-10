import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';

@Injectable()
export class FinancialService {
  constructor(private prisma: PrismaService) { }

  async getBalance(userId: string) {
    const account = await this.prisma.account.findUnique({
      where: { userId },
    });

    return {
      balance: account?.balance || 0,
      bonusBalance: account?.bonusBalance || 0,
      lockedBalance: account?.lockedBalance || 0,
      currency: account?.currency || 'BRL',
    };
  }

  async createDeposit(userId: string, depositDto: DepositDto) {
    const account = await this.prisma.account.findUnique({
      where: { userId },
    });

    // Generate PIX QR code (in real implementation, integrate with PIX API)
    const pixCode = this.generatePixCode(depositDto.amount);

    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        accountId: account.id,
        type: 'DEPOSIT',
        amount: depositDto.amount,
        method: 'PIX',
        pixKey: depositDto.pixKey,
        status: 'PENDING',
      },
    });

    return {
      transactionId: transaction.id,
      pixCode,
      qrCode: this.generateQrCode(pixCode),
      amount: depositDto.amount,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    };
  }

  async createWithdraw(userId: string, withdrawDto: WithdrawDto) {
    const account = await this.prisma.account.findUnique({
      where: { userId },
    });

    if (Number(account.balance) < Number(withdrawDto.amount)) {
      throw new Error('Insufficient balance');
    }

    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        accountId: account.id,
        type: 'WITHDRAWAL',
        amount: withdrawDto.amount,
        method: 'PIX',
        pixKey: withdrawDto.pixKey,
        status: 'PENDING',
      },
    });

    // Lock the amount
    await this.prisma.account.update({
      where: { id: account.id },
      data: {
        balance: { decrement: withdrawDto.amount },
        lockedBalance: { increment: withdrawDto.amount },
      },
    });

    return {
      transactionId: transaction.id,
      amount: withdrawDto.amount,
      status: 'PENDING',
    };
  }

  async getTransactions(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  private generatePixCode(amount: number): string {
    // Simplified PIX code generation
    // In production, use proper PIX API
    return `00020126580014br.gov.bcb.pix0136${Date.now()}520400005303986540${amount.toFixed(2)}5802BR5925SORTE AGORA LTDA6009SAO PAULO62070503***6304`;
  }

  private generateQrCode(pixCode: string): string {
    // In production, generate actual QR code image
    return `data:image/png;base64,${pixCode}`;
  }
}
