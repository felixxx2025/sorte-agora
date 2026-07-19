import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CasinoController } from "./casino.controller";
import { CasinoService } from "./casino.service";
import { CASINO_PROVIDER } from "./providers/casino-provider.interface";
import { DemoCasinoProvider } from "./providers/demo-casino.provider";
import { LiveCasinoProvider } from "./providers/live-casino.provider";

@Module({
  imports: [ConfigModule],
  controllers: [CasinoController],
  providers: [
    CasinoService,
    DemoCasinoProvider,
    LiveCasinoProvider,
    {
      provide: CASINO_PROVIDER,
      useFactory: (
        config: ConfigService,
        demo: DemoCasinoProvider,
        live: LiveCasinoProvider,
      ) => {
        const mode = config.get("CASINO_PROVIDER_MODE") || "demo";
        return mode === "live" ? live : demo;
      },
      inject: [ConfigService, DemoCasinoProvider, LiveCasinoProvider],
    },
  ],
  exports: [CasinoService],
})
export class CasinoModule {}
