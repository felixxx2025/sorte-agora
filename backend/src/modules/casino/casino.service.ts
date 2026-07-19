import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { CacheService } from '../../common/services/cache.service';
import { PrismaService } from '../../database/prisma.service';
import { LaunchGameDto } from './dto/launch-game.dto';

@Injectable()
export class CasinoService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private cache: CacheService,
  ) {}

  async getGames(category?: string) {
    const cacheKey = `casino:games:${category || 'all'}`;
    const cached = await this.cache.getJson<any[]>(cacheKey);
    if (cached) return cached;

    const where = category ? { category } : {};

    const games = await this.prisma.casinoGame.findMany({
      where: {
        ...where,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    await this.cache.setJson(cacheKey, games, 60);
    return games;
  }

  async getGame(id: string) {
    const game = await this.prisma.casinoGame.findUnique({ where: { id } });
    if (!game) throw new NotFoundException('Game not found');
    return game;
  }

  async launchGame(
    gameId: string,
    launchGameDto: LaunchGameDto & { userId: string },
  ) {
    const game = await this.prisma.casinoGame.findUnique({
      where: { id: gameId },
    });

    if (!game || !game.isActive) {
      throw new NotFoundException('Game not found');
    }

    if (!launchGameDto.userId) {
      throw new BadRequestException('userId is required');
    }

    const sessionToken = this.generateSessionToken();
    const session = await this.prisma.casinoSession.create({
      data: {
        userId: launchGameDto.userId,
        gameId,
        sessionToken,
      },
    });

    const gameUrl = this.buildProviderUrl(game, sessionToken);

    return {
      sessionId: session.id,
      sessionToken,
      gameUrl,
      provider: game.provider,
      mode: this.configService.get('CASINO_PROVIDER_MODE') || 'demo',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
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
    return crypto.randomBytes(24).toString('hex');
  }

  private buildProviderUrl(game: any, sessionToken: string): string {
    const mode = this.configService.get('CASINO_PROVIDER_MODE') || 'demo';
    const base =
      this.configService.get('CASINO_PROVIDER_BASE_URL') ||
      'https://demo-casino.sorteagora.local';

    if (mode === 'live') {
      return `${base}/launch/${game.provider}/${game.providerGameId}?token=${sessionToken}`;
    }

    // Demo adapter: página local simulada (Fase 2)
    const frontend =
      this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    return `${frontend}/casino/play?game=${encodeURIComponent(game.providerGameId)}&token=${sessionToken}&name=${encodeURIComponent(game.name)}`;
  }
}
