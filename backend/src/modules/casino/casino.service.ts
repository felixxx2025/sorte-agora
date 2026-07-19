import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";
import { CacheService } from "../../common/services/cache.service";
import { PrismaService } from "../../database/prisma.service";
import { LaunchGameDto } from "./dto/launch-game.dto";
import {
  CASINO_PROVIDER,
  CasinoProvider,
} from "./providers/casino-provider.interface";

@Injectable()
export class CasinoService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private cache: CacheService,
    @Inject(CASINO_PROVIDER) private casinoProvider: CasinoProvider,
  ) {}

  async getGames(category?: string) {
    const cacheKey = `casino:games:${category || "all"}`;
    const cached = await this.cache.getJson<any[]>(cacheKey);
    if (cached) return cached;

    const where = category ? { category } : {};

    const games = await this.prisma.casinoGame.findMany({
      where: {
        ...where,
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    await this.cache.setJson(cacheKey, games, 60);
    return games;
  }

  async getGame(id: string) {
    const game = await this.prisma.casinoGame.findUnique({ where: { id } });
    if (!game) throw new NotFoundException("Game not found");
    return game;
  }

  async getGameBySlug(slug: string) {
    const game = await this.prisma.casinoGame.findUnique({ where: { slug } });
    if (!game) throw new NotFoundException("Game not found");
    return game;
  }

  async getJackpots() {
    const games = await this.prisma.casinoGame.findMany({
      where: { hasJackpot: true, isActive: true },
      orderBy: { jackpotAmount: "desc" },
    });

    return games.map((g) => ({
      id: g.id,
      name: g.name,
      amount: Number(g.jackpotAmount ?? 0),
      currency: "BRL",
      thumbnailUrl: g.thumbnail,
      category: g.category,
      slug: g.slug,
    }));
  }

  async launchGame(
    gameId: string,
    launchGameDto: LaunchGameDto & { userId: string },
  ) {
    await this.assertPlayAllowed(launchGameDto.userId);

    const game = await this.prisma.casinoGame.findUnique({
      where: { id: gameId },
    });

    if (!game || !game.isActive) {
      throw new NotFoundException("Game not found");
    }

    if (!launchGameDto.userId) {
      throw new BadRequestException("userId is required");
    }

    const sessionToken = this.generateSessionToken();
    const session = await this.prisma.casinoSession.create({
      data: {
        userId: launchGameDto.userId,
        gameId,
        sessionToken,
      },
    });

    const launch = await this.casinoProvider.launch({
      game: {
        id: game.id,
        name: game.name,
        provider: game.provider,
        providerGameId: game.providerGameId,
      },
      sessionToken,
      userId: launchGameDto.userId,
    });

    return {
      sessionId: session.id,
      sessionToken,
      gameUrl: launch.gameUrl,
      provider: game.provider,
      mode: launch.mode,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
  }

  async getSessions(userId: string) {
    return this.prisma.casinoSession.findMany({
      where: { userId },
      orderBy: { startedAt: "desc" },
      take: 20,
      include: { game: true },
    });
  }

  private async assertPlayAllowed(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { selfExcludedUntil: true, deletedAt: true, isActive: true },
    });
    if (!user || user.deletedAt || !user.isActive) {
      throw new ForbiddenException("Account unavailable");
    }
    if (user.selfExcludedUntil && user.selfExcludedUntil > new Date()) {
      throw new ForbiddenException("Self-exclusion active");
    }
  }

  private generateSessionToken(): string {
    return crypto.randomBytes(24).toString("hex");
  }
}
