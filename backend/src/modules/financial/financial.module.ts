import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AffiliatesModule } from "../affiliates/affiliates.module";
import { FinancialController } from "./financial.controller";
import { FinancialService } from "./financial.service";
import { HttpPixProvider } from "./providers/http-pix.provider";
import { PIX_PROVIDER } from "./providers/pix-provider.interface";
import { SandboxPixProvider } from "./providers/sandbox-pix.provider";
import { WebhooksController } from "./webhooks.controller";

@Module({
  imports: [ConfigModule, AffiliatesModule],
  controllers: [FinancialController, WebhooksController],
  providers: [
    FinancialService,
    SandboxPixProvider,
    HttpPixProvider,
    {
      provide: PIX_PROVIDER,
      useFactory: (
        config: ConfigService,
        sandbox: SandboxPixProvider,
        http: HttpPixProvider,
      ) => {
        const mode = (config.get("PIX_PROVIDER_MODE") || "sandbox").toLowerCase();
        return mode === "http" || mode === "mercadopago" ? http : sandbox;
      },
      inject: [ConfigService, SandboxPixProvider, HttpPixProvider],
    },
  ],
  exports: [FinancialService],
})
export class FinancialModule {}
