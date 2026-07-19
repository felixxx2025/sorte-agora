import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CasinoController } from "./casino.controller";
import { CasinoService } from "./casino.service";
import { PgSoftWalletController } from "./pgsoft-wallet.controller";
import { PgSoftWalletService } from "./pgsoft-wallet.service";
import { CASINO_PROVIDER } from "./providers/casino-provider.interface";
import { DemoCasinoProvider } from "./providers/demo-casino.provider";
import { LiveCasinoProvider } from "./providers/live-casino.provider";
import { PgSoftCasinoProvider } from "./providers/pgsoft-casino.provider";

@Module({
  imports: [ConfigModule],
  controllers: [CasinoController, PgSoftWalletController],
  providers: [
    CasinoService,
    DemoCasinoProvider,
    LiveCasinoProvider,
    PgSoftCasinoProvider,
    PgSoftWalletService,
    {
      provide: CASINO_PROVIDER,
      useFactory: (
        config: ConfigService,
        demo: DemoCasinoProvider,
        live: LiveCasinoProvider,
        pgsoft: PgSoftCasinoProvider,
      ) => {
        const mode = (config.get("CASINO_PROVIDER_MODE") || "demo").toLowerCase();
        if (mode === "pgsoft") return pgsoft;
        if (mode === "live") return live;
        return demo;
      },
      inject: [
        ConfigService,
        DemoCasinoProvider,
        LiveCasinoProvider,
        PgSoftCasinoProvider,
      ],
    },
  ],
  exports: [CasinoService, PgSoftCasinoProvider],
})
export class CasinoModule {}
