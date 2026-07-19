import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CacheService } from '../../common/services/cache.service';
import { PrismaService } from '../../database/prisma.service';
import { VipService } from '../vip/vip.service';
import { PlaceBetDto } from './dto/place-bet.dto';

@Injectable()
export class SportsService {
  constructor(
    private prisma: PrismaService,
    private vipService: VipService,
    private cache: CacheService,
  ) { }

  async getEvents(isLive: boolean = false) {
    const cacheKey = `sports:events:live=${isLive}`;
    const cached = await this.cache.getJson<any[]>(cacheKey);
    if (cached) return cached;

    const events = await this.prisma.sportsEvent.findMany({
      where: isLive ? { isLive: true } : undefined,
      include: {
        markets: {
          include: {
            selections: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
      take: 50,
    });

    await this.cache.setJson(cacheKey, events, 30);
    return events;
  }

  async getEvent(id: string) {
    const event = await this.prisma.sportsEvent.findUnique({
      where: { id },
      include: {
        markets: {
          include: {
            selections: true,
          },
        },
      },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async placeBet(userId: string, placeBetDto: PlaceBetDto) {
    const selection = await this.prisma.sportsSelection.findUnique({
      where: { id: placeBetDto.selectionId },
      include: { market: { include: { event: true } } },
    });

    if (!selection) {
      throw new NotFoundException('Selection not found');
    }

    const account = await this.prisma.account.findUnique({
      where: { userId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (Number(account.balance) < Number(placeBetDto.stake)) {
      throw new BadRequestException('Insufficient balance');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const bet = await tx.sportsBet.create({
        data: {
          userId,
          eventId: selection.market.eventId,
          selectionId: placeBetDto.selectionId,
          stake: placeBetDto.stake,
          odds: selection.odds,
          status: 'PENDING',
        },
      });

      await tx.account.update({
        where: { id: account.id },
        data: { balance: { decrement: placeBetDto.stake } },
      });

      await tx.transaction.create({
        data: {
          userId,
          accountId: account.id,
          type: 'BET',
          amount: placeBetDto.stake,
          status: 'COMPLETED',
        },
      });

      return bet;
    });

    try {
      await this.vipService.addProgress(userId, 'BETS_COUNT', 1);
      await this.vipService.addProgress(
        userId,
        'BET_AMOUNT',
        Math.floor(Number(placeBetDto.stake)),
      );
    } catch {
      // VIP progress não deve quebrar aposta
    }

    return {
      betId: result.id,
      potentialWin: Number(placeBetDto.stake) * Number(selection.odds),
      status: 'PENDING',
    };
  }

  async getBets(userId: string) {
    return this.prisma.sportsBet.findMany({
      where: { userId },
      include: {
        event: true,
        selection: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  /**
   * Liquida aposta: WON credita payout; LOST encerra sem crédito.
   */
  async settleBet(betId: string, result: 'WON' | 'LOST') {
    const bet = await this.prisma.sportsBet.findUnique({
      where: { id: betId },
    });

    if (!bet) {
      throw new NotFoundException('Bet not found');
    }

    if (bet.status !== 'PENDING') {
      throw new BadRequestException(`Bet already settled as ${bet.status}`);
    }

    if (result === 'LOST') {
      return this.prisma.sportsBet.update({
        where: { id: betId },
        data: {
          status: 'LOST',
          settledAt: new Date(),
          payout: 0,
        },
      });
    }

    const payout = Number(bet.stake) * Number(bet.odds);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.sportsBet.update({
        where: { id: betId },
        data: {
          status: 'WON',
          settledAt: new Date(),
          payout,
        },
      });

      const account = await tx.account.findUnique({
        where: { userId: bet.userId },
      });

      if (account) {
        await tx.account.update({
          where: { id: account.id },
          data: { balance: { increment: payout } },
        });

        await tx.transaction.create({
          data: {
            userId: bet.userId,
            accountId: account.id,
            type: 'WIN',
            amount: payout,
            status: 'COMPLETED',
            processedAt: new Date(),
          },
        });
      }

      return updated;
    });
  }
}
