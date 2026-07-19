import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AffiliatesModule } from "../affiliates/affiliates.module";
import { VipModule } from "../vip/vip.module";
import { HttpOddsProvider } from "./providers/http-odds.provider";
import { ODDS_PROVIDER } from "./providers/odds-provider.interface";
import { StaticOddsProvider } from "./providers/static-odds.provider";
import { SportsSettlementJob } from "./sports-settlement.job";
import { SportsController } from "./sports.controller";
import { SportsService } from "./sports.service";

@Module({
  imports: [ConfigModule, VipModule, AffiliatesModule],
  controllers: [SportsController],
  providers: [
    SportsService,
    SportsSettlementJob,
    StaticOddsProvider,
    HttpOddsProvider,
    {
      provide: ODDS_PROVIDER,
      useFactory: (
        config: ConfigService,
        staticProvider: StaticOddsProvider,
        http: HttpOddsProvider,
      ) => {
        const mode = (config.get("SPORTS_ODDS_MODE") || "static").toLowerCase();
        return mode === "http" ? http : staticProvider;
      },
      inject: [ConfigService, StaticOddsProvider, HttpOddsProvider],
    },
  ],
  exports: [SportsService],
})
export class SportsModule {}
