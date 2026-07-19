import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { AffiliatesService } from '../affiliates/affiliates.service';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import {
  PIX_PROVIDER,
  PixProvider,
} from './providers/pix-provider.interface';

@Injectable()
export class FinancialService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private affiliatesService: AffiliatesService,
    @Inject(PIX_PROVIDER) private pixProvider: PixProvider,
  ) { }

  async getBalance(userId: string) {
    const account = await this.prisma.account.findUnique({
      where: { userId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return {
      balance: account.balance,
      bonusBalance: account.bonusBalance,
      lockedBalance: account.lockedBalance,
      currency: account.currency,
    };
  }

  async createDeposit(userId: string, depositDto: DepositDto) {
    await this.assertNotSelfExcluded(userId);

    const account = await this.prisma.account.findUnique({
      where: { userId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (!depositDto.amount || Number(depositDto.amount) <= 0) {
      throw new BadRequestException('Invalid deposit amount');
    }

    await this.assertDailyLimit(userId, 'DEPOSIT', Number(depositDto.amount));

    const charge = await this.pixProvider.createCharge({
      amount: Number(depositDto.amount),
      userId,
      pixKey: depositDto.pixKey,
    });

    const autoConfirm = this.shouldAutoConfirmPix();

    if (autoConfirm) {
      const result = await this.prisma.$transaction(async (tx) => {
        const transaction = await tx.transaction.create({
          data: {
            userId,
            accountId: account.id,
            type: 'DEPOSIT',
            amount: depositDto.amount,
            method: 'PIX',
            pixKey: depositDto.pixKey,
            externalId: charge.externalId,
            providerRef: charge.providerRef || this.pixProvider.name,
            status: 'COMPLETED',
            processedAt: new Date(),
          },
        });

        const updatedAccount = await tx.account.update({
          where: { id: account.id },
          data: {
            balance: { increment: depositDto.amount },
          },
        });

        return { transaction, updatedAccount };
      });

      await this.maybeRecordReferralCommission(
        userId,
        Number(depositDto.amount),
        'DEPOSIT',
      );

      return {
        transactionId: result.transaction.id,
        externalId: charge.externalId,
        pixCode: charge.pixCode,
        qrCode: charge.qrCode,
        amount: depositDto.amount,
        status: 'COMPLETED',
        balance: result.updatedAccount.balance,
        expiresAt: charge.expiresAt,
        autoConfirmed: true,
        provider: this.pixProvider.name,
      };
    }

    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        accountId: account.id,
        type: 'DEPOSIT',
        amount: depositDto.amount,
        method: 'PIX',
        pixKey: depositDto.pixKey,
        externalId: charge.externalId,
        providerRef: charge.providerRef || this.pixProvider.name,
        status: 'PENDING',
      },
    });

    return {
      transactionId: transaction.id,
      externalId: charge.externalId,
      pixCode: charge.pixCode,
      qrCode: charge.qrCode,
      amount: depositDto.amount,
      status: 'PENDING',
      expiresAt: charge.expiresAt,
      autoConfirmed: false,
      provider: this.pixProvider.name,
    };
  }

  async getDepositStatus(userId: string, transactionId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id: transactionId, userId, type: 'DEPOSIT' },
    });
    if (!transaction) throw new NotFoundException('Deposit not found');
    const account = await this.prisma.account.findUnique({ where: { userId } });
    return {
      transactionId: transaction.id,
      externalId: transaction.externalId,
      status: transaction.status,
      amount: transaction.amount,
      balance: account?.balance,
    };
  }

  /**
   * Confirma depósito PENDING (user JWT ou webhook via confirmByExternalId).
   */
  async confirmDeposit(userId: string, transactionId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
        type: 'DEPOSIT',
      },
    });

    if (!transaction) {
      throw new NotFoundException('Deposit transaction not found');
    }

    return this.completePendingDeposit(transaction);
  }

  async confirmByExternalId(externalId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { externalId, type: 'DEPOSIT' },
    });

    if (!transaction) {
      throw new NotFoundException('Deposit not found for externalId');
    }

    return this.completePendingDeposit(transaction);
  }

  private async completePendingDeposit(transaction: {
    id: string;
    userId: string;
    accountId: string;
    amount: any;
    status: string;
    externalId: string | null;
  }) {
    if (transaction.status === 'COMPLETED') {
      return {
        transactionId: transaction.id,
        externalId: transaction.externalId,
        status: 'COMPLETED',
        message: 'Deposit already confirmed',
        idempotent: true,
      };
    }

    if (transaction.status !== 'PENDING') {
      throw new BadRequestException(
        `Cannot confirm deposit with status ${transaction.status}`,
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedTx = await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'COMPLETED',
          processedAt: new Date(),
        },
      });

      const updatedAccount = await tx.account.update({
        where: { id: transaction.accountId },
        data: {
          balance: { increment: transaction.amount },
        },
      });

      return { updatedTx, updatedAccount };
    });

    await this.maybeRecordReferralCommission(
      transaction.userId,
      Number(transaction.amount),
      'DEPOSIT',
    );

    return {
      transactionId: result.updatedTx.id,
      externalId: result.updatedTx.externalId,
      status: 'COMPLETED',
      balance: result.updatedAccount.balance,
      message: 'Deposit confirmed',
      idempotent: false,
    };
  }

  async createWithdraw(userId: string, withdrawDto: WithdrawDto) {
    await this.assertNotSelfExcluded(userId);

    const account = await this.prisma.account.findUnique({
      where: { userId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (!withdrawDto.amount || Number(withdrawDto.amount) <= 0) {
      throw new BadRequestException('Invalid withdraw amount');
    }

    if (Number(account.balance) < Number(withdrawDto.amount)) {
      throw new BadRequestException('Insufficient balance');
    }

    await this.assertDailyLimit(userId, 'WITHDRAWAL', Number(withdrawDto.amount));

    const result = await this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
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

      await tx.account.update({
        where: { id: account.id },
        data: {
          balance: { decrement: withdrawDto.amount },
          lockedBalance: { increment: withdrawDto.amount },
        },
      });

      return transaction;
    });

    return {
      transactionId: result.id,
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

  private async assertNotSelfExcluded(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { selfExcludedUntil: true, deletedAt: true, isActive: true },
    });
    if (!user || user.deletedAt || !user.isActive) {
      throw new ForbiddenException('Account unavailable');
    }
    if (user.selfExcludedUntil && user.selfExcludedUntil > new Date()) {
      throw new ForbiddenException('Self-exclusion active');
    }
  }

  private async assertDailyLimit(
    userId: string,
    type: 'DEPOSIT' | 'WITHDRAWAL',
    amount: number,
  ) {
    const limitKey =
      type === 'DEPOSIT' ? 'DEPOSIT_DAILY_LIMIT' : 'WITHDRAW_DAILY_LIMIT';
    const defaultLimit = type === 'DEPOSIT' ? 50000 : 20000;
    const limit = Number(this.configService.get(limitKey) || defaultLimit);
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const agg = await this.prisma.transaction.aggregate({
      where: {
        userId,
        type,
        status: { in: ['PENDING', 'COMPLETED'] },
        createdAt: { gte: start },
      },
      _sum: { amount: true },
    });

    const used = Number(agg._sum.amount || 0);
    if (used + amount > limit) {
      throw new BadRequestException(
        `Daily ${type.toLowerCase()} limit exceeded (R$ ${limit})`,
      );
    }
  }

  private async maybeRecordReferralCommission(
    userId: string,
    amount: number,
    source: string,
  ) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { referredById: true },
      });
      if (!user?.referredById) return;

      await this.affiliatesService.recordCommission({
        affiliateUserId: user.referredById,
        referredUserId: userId,
        amount,
        source,
      });
    } catch {
      // Comissão não deve quebrar o crédito do depósito
    }
  }

  private shouldAutoConfirmPix(): boolean {
    const flag = this.configService.get('PIX_AUTO_CONFIRM');
    if (flag === 'true') return true;
    if (flag === 'false') return false;
    return this.configService.get('NODE_ENV') !== 'production';
  }
}
