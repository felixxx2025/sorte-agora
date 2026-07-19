import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AffiliatesModule } from '../affiliates/affiliates.module';
import { FinancialController } from './financial.controller';
import { FinancialService } from './financial.service';

@Module({
  imports: [ConfigModule, AffiliatesModule],
  controllers: [FinancialController],
  providers: [FinancialService],
  exports: [FinancialService],
})
export class FinancialModule {}
