import {
  BadRequestException,
  Injectable,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../database/prisma.service";

/**
 * Wallet seamless PG Soft — callbacks VerifySession / Cash/Get / Cash/TransferInOut.
 * Valores monetários em unidades da moeda (BRL), convertidos de/para string decimal.
 */
@Injectable()
export class PgSoftWalletService {
  private readonly logger = new Logger(PgSoftWalletService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  private ok(data: Record<string, unknown>) {
    return { data, error: null };
  }

  private fail(code: string, message: string) {
    return { data: null, error: { code, message } };
  }

  private assertOperatorToken(token?: string) {
    const expected = (this.config.get("PGSOFT_OPERATOR_TOKEN") || "").trim();
    if (!expected) return; // sandbox: não exige
    if (!token || token !== expected) {
      throw new BadRequestException("Invalid operator token");
    }
  }

  async verifySession(body: {
    operator_token?: string;
    secret_key?: string;
    operator_player_session?: string;
    player_name?: string;
  }) {
    this.assertOperatorToken(body.operator_token);
    const sessionToken = body.operator_player_session;
    if (!sessionToken) return this.fail("1034", "Missing session");

    const session = await this.prisma.casinoSession.findUnique({
      where: { sessionToken },
      include: { user: true, game: true },
    });
    if (!session || session.endedAt) {
      return this.fail("1034", "Invalid session");
    }

    return this.ok({
      player_name: session.userId,
      nickname: session.user.firstName || session.user.email,
      currency: session.user.currency || "BRL",
    });
  }

  async getBalance(body: {
    operator_token?: string;
    operator_player_session?: string;
    player_name?: string;
  }) {
    this.assertOperatorToken(body.operator_token);
    const sessionToken = body.operator_player_session;
    if (!sessionToken) return this.fail("1034", "Missing session");

    const session = await this.prisma.casinoSession.findUnique({
      where: { sessionToken },
    });
    if (!session) return this.fail("1034", "Invalid session");

    const account = await this.prisma.account.findUnique({
      where: { userId: session.userId },
    });
    if (!account) return this.fail("3004", "Account not found");

    const balance = Number(account.balance);
    return this.ok({
      currency_code: "BRL",
      balance_amount: balance.toFixed(2),
      updated_time: Date.now(),
    });
  }

  /**
   * transfer_amount < 0 = débito (aposta); > 0 = crédito (ganho).
   * Idempotente por transaction_id (providerRef).
   */
  async transferInOut(body: {
    operator_token?: string;
    operator_player_session?: string;
    player_name?: string;
    transfer_amount?: string | number;
    currency_code?: string;
    transaction_id?: string;
    bet_type?: number | string;
    game_id?: string | number;
  }) {
    this.assertOperatorToken(body.operator_token);
    const sessionToken = body.operator_player_session;
    const txId = String(body.transaction_id || "");
    const amount = Number(body.transfer_amount);

    if (!sessionToken || !txId || !Number.isFinite(amount) || amount === 0) {
      return this.fail("1034", "Invalid transfer payload");
    }

    const existing = await this.prisma.transaction.findUnique({
      where: { externalId: `pgsoft:${txId}` },
    });
    if (existing) {
      const account = await this.prisma.account.findUnique({
        where: { userId: existing.userId },
      });
      return this.ok({
        currency_code: "BRL",
        balance_amount: Number(account?.balance ?? 0).toFixed(2),
        updated_time: Date.now(),
      });
    }

    const session = await this.prisma.casinoSession.findUnique({
      where: { sessionToken },
    });
    if (!session) return this.fail("1034", "Invalid session");

    const account = await this.prisma.account.findUnique({
      where: { userId: session.userId },
    });
    if (!account) return this.fail("3004", "Account not found");

    const bal = Number(account.balance);
    if (amount < 0 && bal + amount < -0.0000001) {
      return this.fail("3004", "Insufficient balance");
    }

    const type = amount < 0 ? "CASINO_BET" : "CASINO_WIN";

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const updated = await tx.account.update({
          where: { id: account.id },
          data: { balance: { increment: amount } },
        });
        await tx.transaction.create({
          data: {
            userId: session.userId,
            accountId: account.id,
            type,
            amount: Math.abs(amount),
            method: "PGSOFT",
            externalId: `pgsoft:${txId}`,
            providerRef: String(body.game_id || session.gameId),
            status: "COMPLETED",
            processedAt: new Date(),
          },
        });
        if (amount < 0) {
          await tx.casinoSession.update({
            where: { id: session.id },
            data: { totalBet: { increment: Math.abs(amount) } },
          });
        } else {
          await tx.casinoSession.update({
            where: { id: session.id },
            data: { totalWin: { increment: amount } },
          });
        }
        return updated;
      });

      return this.ok({
        currency_code: "BRL",
        balance_amount: Number(result.balance).toFixed(2),
        updated_time: Date.now(),
      });
    } catch (err: any) {
      this.logger.error(`PG Soft transfer failed: ${err?.message}`);
      return this.fail("1200", "Transfer failed");
    }
  }
}
