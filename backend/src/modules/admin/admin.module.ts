import { Module } from "@nestjs/common";
import { AffiliatesModule } from "../affiliates/affiliates.module";
import { FinancialModule } from "../financial/financial.module";
import { PromosModule } from "../promos/promos.module";
import { SportsModule } from "../sports/sports.module";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";

@Module({
  imports: [SportsModule, FinancialModule, AffiliatesModule, PromosModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
