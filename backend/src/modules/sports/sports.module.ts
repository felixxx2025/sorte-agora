import { Module } from "@nestjs/common";
import { AffiliatesModule } from "../affiliates/affiliates.module";
import { VipModule } from "../vip/vip.module";
import { SportsSettlementJob } from "./sports-settlement.job";
import { SportsController } from "./sports.controller";
import { SportsService } from "./sports.service";

@Module({
  imports: [VipModule, AffiliatesModule],
  controllers: [SportsController],
  providers: [SportsService, SportsSettlementJob],
  exports: [SportsService],
})
export class SportsModule {}
