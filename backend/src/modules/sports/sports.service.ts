import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PlaceBetDto } from './dto/place-bet.dto';

@Injectable()
export class SportsService {
  constructor(private prisma: PrismaService) { }

  async getEvents(isLive: boolean = false) {
    return this.prisma.sportsEvent.findMany({
      where: { isLive },
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
  }

  async getEvent(id: string) {
    return this.prisma.sportsEvent.findUnique({
      where: { id },
      include: {
        markets: {
          include: {
            selections: true,
          },
        },
      },
    });
  }

  async placeBet(placeBetDto: PlaceBetDto) {
    const selection = await this.prisma.sportsSelection.findUnique({
      where: { id: placeBetDto.selectionId },
      include: { market: { include: { event: true } } },
    });

    if (!selection) {
      throw new Error('Selection not found');
    }

    // Check user balance
    const account = await this.prisma.account.findUnique({
      where: { userId: placeBetDto.userId },
    });

    if (Number(account.balance) < Number(placeBetDto.stake)) {
      throw new Error('Insufficient balance');
    }

    // Create bet
    const bet = await this.prisma.sportsBet.create({
      data: {
        userId: placeBetDto.userId,
        eventId: selection.market.eventId,
        selectionId: placeBetDto.selectionId,
        stake: placeBetDto.stake,
        odds: selection.odds,
        status: 'PENDING',
      },
    });

    // Deduct balance
    await this.prisma.account.update({
      where: { id: account.id },
      data: { balance: { decrement: placeBetDto.stake } },
    });

    // Create transaction
    await this.prisma.transaction.create({
      data: {
        userId: placeBetDto.userId,
        accountId: account.id,
        type: 'BET',
        amount: placeBetDto.stake,
        status: 'COMPLETED',
      },
    });

    return {
      betId: bet.id,
      potentialWin: placeBetDto.stake * Number(selection.odds),
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
}
