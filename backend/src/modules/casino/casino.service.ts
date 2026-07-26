import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
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

export type PgSoftCatalogEntry = {
  providerGameId: string;
  name: string;
  slug: string;
  category: string;
  rtp: number | null;
  thumbnail: string;
  description?: string | null;
  isNew?: boolean;
  maxWin?: string | null;
  catalogGid?: string;
  code?: string;
};

/** Catálogo completo PG Soft (pgid = launch ID). Fonte: data/pgsoft-games.json */
export function loadPgSoftCatalog(): PgSoftCatalogEntry[] {
  const candidates = [
    path.join(__dirname, "data", "pgsoft-games.json"),
    path.join(
      process.cwd(),
      "src/modules/casino/data/pgsoft-games.json",
    ),
    path.join(
      process.cwd(),
      "dist/src/modules/casino/data/pgsoft-games.json",
    ),
  ];
  for (const file of candidates) {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, "utf8")) as PgSoftCatalogEntry[];
    }
  }
  throw new Error("pgsoft-games.json não encontrado");
}

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
      take: 500,
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
    const catalog = loadPgSoftCatalog();
    const activeIds = new Set(catalog.map((g) => g.providerGameId));
    let upserted = 0;

    for (const g of catalog) {
      const features = {
        maxWin: g.maxWin ?? null,
        catalogGid: g.catalogGid ?? null,
        code: g.code ?? null,
      };
      await this.prisma.casinoGame.upsert({
        where: {
          provider_providerGameId: {
            provider: "PGSOFT",
            providerGameId: g.providerGameId,
          },
        },
        update: {
          name: g.name,
          category: g.category || "slots",
          slug: g.slug,
          rtp: g.rtp,
          thumbnail: g.thumbnail,
          description: g.description ?? null,
          isNew: Boolean(g.isNew),
          features,
          isActive: true,
          demoAvailable: true,
        },
        create: {
          provider: "PGSOFT",
          providerGameId: g.providerGameId,
          name: g.name,
          category: g.category || "slots",
          slug: g.slug,
          rtp: g.rtp,
          thumbnail: g.thumbnail,
          description: g.description ?? null,
          features,
          minBet: 0.2,
          maxBet: 1000,
          isActive: true,
          demoAvailable: true,
          isNew: Boolean(g.isNew),
        },
      });
      upserted += 1;
    }

    const orphans = await this.prisma.casinoGame.findMany({
      where: { provider: "PGSOFT" },
      select: { id: true, providerGameId: true },
    });
    const orphanIds = orphans
      .filter((g) => !activeIds.has(g.providerGameId))
      .map((g) => g.id);
    let deactivated = 0;
    if (orphanIds.length) {
      const result = await this.prisma.casinoGame.updateMany({
        where: { id: { in: orphanIds } },
        data: { isActive: false },
      });
      deactivated = result.count;
    }

    try {
      await this.cache.del("casino:games:all:all");
      await this.cache.del("casino:games:slots:all");
      await this.cache.del("casino:games:all:PGSOFT");
      await this.cache.del("casino:games:slots:PGSOFT");
    } catch {
      /* ignore */
    }
    return {
      upserted,
      deactivated,
      total: catalog.length,
      provider: "PGSOFT",
    };
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
