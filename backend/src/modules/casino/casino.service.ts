import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LaunchGameDto } from './dto/launch-game.dto';

@Injectable()
export class CasinoService {
  constructor(private prisma: PrismaService) {}

  async getGames(category?: string) {
    const where = category ? { category } : {};
    
    return this.prisma.casinoGame.findMany({
      where: {
        ...where,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async getGame(id: string) {
    return this.prisma.casinoGame.findUnique({
      where: { id },
    });
  }

  async launchGame(gameId: string, launchGameDto: LaunchGameDto) {
    const game = await this.prisma.casinoGame.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new Error('Game not found');
    }

    // Create session
    const session = await this.prisma.casinoSession.create({
      data: {
        userId: launchGameDto.userId,
        gameId,
        sessionToken: this.generateSessionToken(),
      },
    });

    // In production, integrate with casino provider API
    // to get the actual game launch URL
    const gameUrl = this.generateGameUrl(game, session.sessionToken);

    return {
      sessionId: session.id,
      gameUrl,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };
  }

  async getSessions(userId: string) {
    return this.prisma.casinoSession.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      take: 20,
      include: { game: true },
    });
  }

  private generateSessionToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private generateGameUrl(game: any, sessionToken: string): string {
    // In production, this would be the actual provider's game URL
    return `https://provider.example.com/games/${game.providerGameId}?token=${sessionToken}`;
  }
}
