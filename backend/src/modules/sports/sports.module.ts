import { Module } from '@nestjs/common';
import { VipModule } from '../vip/vip.module';
import { SportsController } from './sports.controller';
import { SportsService } from './sports.service';

@Module({
  imports: [VipModule],
  controllers: [SportsController],
  providers: [SportsService],
  exports: [SportsService],
})
export class SportsModule {}
