import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';

@Injectable()
export class FinancialService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
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

  /**
   * Cria depósito PIX. Em Fase 1, com PIX_AUTO_CONFIRM=true (padrão em non-production),
   * confirma e credita o saldo atomicamente. Em produção com gateway real, permanece PENDING.
   */
  async createDeposit(userId: string, depositDto: DepositDto) {
    const account = await this.prisma.account.findUnique({
      where: { userId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (!depositDto.amount || Number(depositDto.amount) <= 0) {
      throw new BadRequestException('Invalid deposit amount');
    }

    const pixCode = this.generatePixCode(depositDto.amount);
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

      return {
        transactionId: result.transaction.id,
        pixCode,
        qrCode: this.generateQrCode(pixCode),
        amount: depositDto.amount,
        status: 'COMPLETED',
        balance: result.updatedAccount.balance,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        autoConfirmed: true,
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
        status: 'PENDING',
      },
    });

    return {
      transactionId: transaction.id,
      pixCode,
      qrCode: this.generateQrCode(pixCode),
      amount: depositDto.amount,
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      autoConfirmed: false,
    };
  }

  /**
   * Confirma depósito PENDING (simulação de webhook PIX — Fase 1).
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

    if (transaction.status === 'COMPLETED') {
      return {
        transactionId: transaction.id,
        status: 'COMPLETED',
        message: 'Deposit already confirmed',
      };
    }

    if (transaction.status !== 'PENDING') {
      throw new BadRequestException(`Cannot confirm deposit with status ${transaction.status}`);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedTx = await tx.transaction.update({
        where: { id: transactionId },
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

    return {
      transactionId: result.updatedTx.id,
      status: 'COMPLETED',
      balance: result.updatedAccount.balance,
      message: 'Deposit confirmed',
    };
  }

  async createWithdraw(userId: string, withdrawDto: WithdrawDto) {
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

  private shouldAutoConfirmPix(): boolean {
    const flag = this.configService.get('PIX_AUTO_CONFIRM');
    if (flag === 'true') return true;
    if (flag === 'false') return false;
    return this.configService.get('NODE_ENV') !== 'production';
  }

  private generatePixCode(amount: number): string {
    // Fase 1: payload simulado — gateway real na Fase 2
    return `00020126580014br.gov.bcb.pix0136${Date.now()}520400005303986540${Number(amount).toFixed(2)}5802BR5925SORTE AGORA LTDA6009SAO PAULO62070503***6304`;
  }

  private generateQrCode(pixCode: string): string {
    return `data:image/png;base64,${Buffer.from(pixCode).toString('base64')}`;
  }
}
