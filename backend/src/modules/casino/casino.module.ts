import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CasinoController } from './casino.controller';
import { CasinoService } from './casino.service';

@Module({
  imports: [ConfigModule],
  controllers: [CasinoController],
  providers: [CasinoService],
  exports: [CasinoService],
})
export class CasinoModule {}
