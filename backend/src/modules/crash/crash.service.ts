import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { createHash, randomBytes } from "crypto";
import Redis from "ioredis";
import { PrismaService } from "../../database/prisma.service";

const REDIS_KEY = "crash:round";
const WAITING_MS = 5000;
const CRASHED_DISPLAY_MS = 3000;
const TICK_MS = 100;
const MULTIPLIER_RATE = 0.06; // ~1.00 + t*0.06 per second

export type CrashPhase = "waiting" | "flying" | "crashed";

export interface CrashBetEntry {
  amount: number;
  cashedOut: boolean;
  cashoutMultiplier?: number;
  payout?: number;
}

export interface CrashRoundState {
  roundId: string;
  phase: CrashPhase;
  multiplier: number;
  crashPoint: number;
  seed: string;
  waitingStartedAt: number;
  flyingStartedAt?: number;
  crashedAt?: number;
  bets: Record<string, CrashBetEntry>;
}

@Injectable()
export class CrashService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CrashService.name);
  private timer: NodeJS.Timeout | null = null;
  private ticking = false;

  constructor(
    private prisma: PrismaService,
    @Inject("REDIS_CLIENT") private readonly redis: Redis,
  ) {}

  onModuleInit() {
    this.timer = setInterval(() => void this.tick(), TICK_MS);
    void this.ensureRound();
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  async getState(userId?: string) {
    const round = await this.ensureRound();
    const publicState: Record<string, unknown> = {
      roundId: round.roundId,
      phase: round.phase,
      multiplier: Number(round.multiplier.toFixed(2)),
      crashPoint:
        round.phase === "crashed"
          ? Number(round.crashPoint.toFixed(2))
          : undefined,
    };
    if (userId && round.bets[userId]) {
      publicState.myBet = round.bets[userId];
    }
    return publicState;
  }

  async placeBet(userId: string, amount: number) {
    if (!amount || amount <= 0) {
      throw new BadRequestException("Amount must be positive");
    }

    const round = await this.ensureRound();
    if (round.phase !== "waiting") {
      throw new BadRequestException("Bets only accepted while waiting");
    }
    if (round.bets[userId]) {
      throw new BadRequestException("Already bet this round");
    }

    const account = await this.prisma.account.findUnique({ where: { userId } });
    if (!account) throw new NotFoundException("Account not found");
    if (Number(account.balance) < amount) {
      throw new BadRequestException("Insufficient balance");
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.account.update({
        where: { id: account.id },
        data: { balance: { decrement: amount } },
      });
      await tx.transaction.create({
        data: {
          userId,
          accountId: account.id,
          type: "CRASH_BET",
          amount,
          status: "COMPLETED",
          providerRef: round.roundId,
          processedAt: new Date(),
        },
      });
    });

    round.bets[userId] = { amount, cashedOut: false };
    await this.saveRound(round);

    return {
      roundId: round.roundId,
      amount,
      status: "ACTIVE",
    };
  }

  async cashout(userId: string) {
    const round = await this.loadRound();
    if (!round || round.phase !== "flying") {
      throw new BadRequestException("Cashout only available while flying");
    }

    const bet = round.bets[userId];
    if (!bet) throw new BadRequestException("No active bet");
    if (bet.cashedOut) throw new BadRequestException("Already cashed out");

    const multiplier = this.currentMultiplier(round);
    if (multiplier >= round.crashPoint) {
      throw new BadRequestException("Round already crashed");
    }

    const payout = Number((bet.amount * multiplier).toFixed(8));
    const account = await this.prisma.account.findUnique({ where: { userId } });
    if (!account) throw new NotFoundException("Account not found");

    await this.prisma.$transaction(async (tx) => {
      await tx.account.update({
        where: { id: account.id },
        data: { balance: { increment: payout } },
      });
      await tx.transaction.create({
        data: {
          userId,
          accountId: account.id,
          type: "CRASH_WIN",
          amount: payout,
          status: "COMPLETED",
          providerRef: round.roundId,
          processedAt: new Date(),
        },
      });
    });

    bet.cashedOut = true;
    bet.cashoutMultiplier = Number(multiplier.toFixed(2));
    bet.payout = payout;
    round.multiplier = multiplier;
    await this.saveRound(round);

    return {
      roundId: round.roundId,
      multiplier: bet.cashoutMultiplier,
      payout,
    };
  }

  private async tick() {
    if (this.ticking) return;
    this.ticking = true;
    try {
      const round = await this.ensureRound();
      const now = Date.now();

      if (round.phase === "waiting") {
        if (now - round.waitingStartedAt >= WAITING_MS) {
          round.phase = "flying";
          round.flyingStartedAt = now;
          round.multiplier = 1;
          await this.saveRound(round);
        }
        return;
      }

      if (round.phase === "flying") {
        const multiplier = this.currentMultiplier(round);
        round.multiplier = multiplier;
        if (multiplier >= round.crashPoint) {
          round.phase = "crashed";
          round.multiplier = round.crashPoint;
          round.crashedAt = now;
          await this.saveRound(round);
          // Losers already debited; no further settlement needed
          return;
        }
        await this.saveRound(round);
        return;
      }

      if (round.phase === "crashed") {
        if (now - (round.crashedAt || now) >= CRASHED_DISPLAY_MS) {
          await this.startNewRound();
        }
      }
    } catch (err: any) {
      this.logger.warn(`Crash tick: ${err?.message}`);
    } finally {
      this.ticking = false;
    }
  }

  private currentMultiplier(round: CrashRoundState): number {
    const started = round.flyingStartedAt || Date.now();
    const t = (Date.now() - started) / 1000;
    return Math.min(1 + t * MULTIPLIER_RATE, round.crashPoint);
  }

  private async ensureRound(): Promise<CrashRoundState> {
    const existing = await this.loadRound();
    if (existing) return existing;
    return this.startNewRound();
  }

  private async startNewRound(): Promise<CrashRoundState> {
    const seed = randomBytes(16).toString("hex");
    const crashPoint = this.crashPointFromSeed(seed);
    const round: CrashRoundState = {
      roundId: `cr_${Date.now().toString(36)}_${seed.slice(0, 6)}`,
      phase: "waiting",
      multiplier: 1,
      crashPoint,
      seed,
      waitingStartedAt: Date.now(),
      bets: {},
    };
    await this.saveRound(round);
    return round;
  }

  /** Provably-fair-ish demo: hash → crash between 1.00 and ~20x (house edge). */
  private crashPointFromSeed(seed: string): number {
    const hash = createHash("sha256").update(seed).digest("hex");
    const n = parseInt(hash.slice(0, 8), 16);
    const r = n / 0xffffffff;
    // Inverse-ish curve with ~3% house edge feel; clamp [1.00, 20]
    const point = Math.max(1, 0.97 / (1 - r * 0.97));
    return Number(Math.min(point, 20).toFixed(2));
  }

  private async loadRound(): Promise<CrashRoundState | null> {
    const raw = await this.redis.get(REDIS_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as CrashRoundState;
    } catch {
      return null;
    }
  }

  private async saveRound(round: CrashRoundState) {
    await this.redis.set(REDIS_KEY, JSON.stringify(round), "EX", 3600);
  }
}
