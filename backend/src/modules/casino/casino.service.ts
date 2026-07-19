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
import { DemoCasinoProvider } from "./providers/demo-casino.provider";
import { LiveCasinoProvider } from "./providers/live-casino.provider";
import { PgSoftCasinoProvider } from "./providers/pgsoft-casino.provider";

/** Catálogo público PG Soft (IDs oficiais) — sem assets proprietários. */
export const PGSOFT_CATALOG = [
  { providerGameId: "126", name: "Fortune Tiger", category: "slots", slug: "pgsoft-fortune-tiger", rtp: 96.81, thumbnail: "/games/pgsoft/fortune-tiger.png" },
  { providerGameId: "98", name: "Fortune Ox", category: "slots", slug: "pgsoft-fortune-ox", rtp: 96.75, thumbnail: "/games/pgsoft/fortune-ox.png" },
  { providerGameId: "68", name: "Fortune Mouse", category: "slots", slug: "pgsoft-fortune-mouse", rtp: 96.95, thumbnail: "/games/pgsoft/fortune-mouse.png" },
  { providerGameId: "1543462", name: "Fortune Rabbit", category: "slots", slug: "pgsoft-fortune-rabbit", rtp: 96.75, thumbnail: "/games/pgsoft/fortune-rabbit.png" },
  { providerGameId: "1695365", name: "Fortune Dragon", category: "slots", slug: "pgsoft-fortune-dragon", rtp: 96.95, thumbnail: "/games/pgsoft/fortune-dragon.png" },
  { providerGameId: "65", name: "Mahjong Ways", category: "slots", slug: "pgsoft-mahjong-ways", rtp: 96.92, thumbnail: "/games/pgsoft/mahjong-ways.png" },
  { providerGameId: "74", name: "Mahjong Ways 2", category: "slots", slug: "pgsoft-mahjong-ways-2", rtp: 96.95, thumbnail: "/games/pgsoft/mahjong-ways-2.png" },
  { providerGameId: "48", name: "Double Fortune", category: "slots", slug: "pgsoft-double-fortune", rtp: 96.97, thumbnail: "/games/pgsoft/double-fortune.png" },
  { providerGameId: "79", name: "Dreams of Macau", category: "slots", slug: "pgsoft-dreams-of-macau", rtp: 96.95, thumbnail: "/games/pgsoft/dreams-macau.png" },
  { providerGameId: "87", name: "Treasures of Aztec", category: "slots", slug: "pgsoft-treasures-aztec", rtp: 96.7, thumbnail: "/games/pgsoft/treasures-aztec.png" },
] as const;

@Injectable()
export class CasinoService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private cache: CacheService,
    @Inject(CASINO_PROVIDER) private casinoProvider: CasinoProvider,
    private demoProvider: DemoCasinoProvider,
    private liveProvider: LiveCasinoProvider,
    private pgsoftProvider: PgSoftCasinoProvider,
  ) {}

  private resolveProvider(gameProvider: string): CasinoProvider {
    const p = (gameProvider || "").toUpperCase();
    if (p === "PGSOFT" || p === "PG_SOFT" || p === "PG") {
      return this.pgsoftProvider;
    }
    const mode = (this.configService.get("CASINO_PROVIDER_MODE") || "demo").toLowerCase();
    if (mode === "pgsoft") return this.pgsoftProvider;
    if (mode === "live") return this.liveProvider;
    return this.demoProvider;
  }

  async getGames(category?: string, provider?: string) {
    const cacheKey = `casino:games:${category || "all"}:${provider || "all"}`;
    const cached = await this.cache.getJson<any[]>(cacheKey);
    if (cached) return cached;

    const where: any = { isActive: true };
    if (category) where.category = category;
    if (provider) where.provider = provider.toUpperCase();

    const games = await this.prisma.casinoGame.findMany({
      where,
      orderBy: [{ isNew: "desc" }, { createdAt: "desc" }],
      take: 200,
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

  async syncPgSoftCatalog() {
    let upserted = 0;
    for (const g of PGSOFT_CATALOG) {
      await this.prisma.casinoGame.upsert({
        where: {
          provider_providerGameId: {
            provider: "PGSOFT",
            providerGameId: g.providerGameId,
          },
        },
        update: {
          name: g.name,
          category: g.category,
          slug: g.slug,
          rtp: g.rtp,
          thumbnail: g.thumbnail,
          isActive: true,
          demoAvailable: true,
        },
        create: {
          provider: "PGSOFT",
          providerGameId: g.providerGameId,
          name: g.name,
          category: g.category,
          slug: g.slug,
          rtp: g.rtp,
          thumbnail: g.thumbnail,
          minBet: 0.2,
          maxBet: 1000,
          isActive: true,
          demoAvailable: true,
          isNew: true,
        },
      });
      upserted += 1;
    }
    try {
      await this.cache.del("casino:games:all:all");
      await this.cache.del("casino:games:slots:all");
      await this.cache.del("casino:games:all:PGSOFT");
    } catch {
      /* ignore */
    }
    return { upserted, provider: "PGSOFT" };
  }

  async launchGame(
    gameId: string,
    launchGameDto: LaunchGameDto & { userId: string; demo?: boolean },
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

    const provider = this.resolveProvider(game.provider);
    const launch = await provider.launch({
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

  async launchDemo(gameId: string, userId: string) {
    return this.launchGame(gameId, {
      userId,
      betAmount: 1,
      demo: true,
    } as any);
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
