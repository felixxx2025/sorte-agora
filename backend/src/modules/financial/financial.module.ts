import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AffiliatesModule } from '../affiliates/affiliates.module';
import { FinancialController } from './financial.controller';
import { FinancialService } from './financial.service';
import { PIX_PROVIDER } from './providers/pix-provider.interface';
import { SandboxPixProvider } from './providers/sandbox-pix.provider';
import { WebhooksController } from './webhooks.controller';

@Module({
  imports: [ConfigModule, AffiliatesModule],
  controllers: [FinancialController, WebhooksController],
  providers: [
    FinancialService,
    SandboxPixProvider,
    {
      provide: PIX_PROVIDER,
      useFactory: (sandbox: SandboxPixProvider) => sandbox,
      inject: [SandboxPixProvider],
    },
  ],
  exports: [FinancialService],
})
export class FinancialModule {}
