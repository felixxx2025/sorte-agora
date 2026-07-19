import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron, CronExpression } from "@nestjs/schedule";
import { CacheService } from "../../common/services/cache.service";
import { PrismaService } from "../../database/prisma.service";
import { SportsService } from "./sports.service";

@Injectable()
export class SportsSettlementJob {
  private readonly logger = new Logger(SportsSettlementJob.name);

  constructor(
    private prisma: PrismaService,
    private sportsService: SportsService,
    private cache: CacheService,
    private config: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    if (this.config.get("SPORTS_SETTLEMENT_CRON") === "false") return;

    const hours = Number(this.config.get("SPORTS_EVENT_TTL_HOURS") || 3);
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);

    const closed = await this.prisma.sportsEvent.updateMany({
      where: {
        status: { in: ["SCHEDULED", "LIVE", "OPEN"] },
        startTime: { lt: cutoff },
      },
      data: { status: "FINISHED", isLive: false },
    });

    if (closed.count > 0) {
      this.logger.log(`Marked ${closed.count} events as FINISHED`);
      await this.cache.del("sports:events:live=true");
      await this.cache.del("sports:events:live=false");
    }

    const finished = await this.prisma.sportsEvent.findMany({
      where: { status: "FINISHED" },
      select: { id: true, winningSelectionId: true },
      take: 50,
    });

    for (const event of finished) {
      const pending = await this.prisma.sportsBet.findMany({
        where: { eventId: event.id, status: "PENDING" },
        take: 100,
      });

      for (const bet of pending) {
        try {
          if (event.winningSelectionId) {
            const result =
              bet.selectionId === event.winningSelectionId ? "WON" : "LOST";
            await this.sportsService.settleBet(bet.id, result);
          } else if (this.config.get("SPORTS_AUTO_SETTLE_LOST") === "true") {
            await this.sportsService.settleBet(bet.id, "LOST");
          }
        } catch (err: any) {
          this.logger.warn(`Settle ${bet.id}: ${err?.message}`);
        }
      }
    }
  }
}
