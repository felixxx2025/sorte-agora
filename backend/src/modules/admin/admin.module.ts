import { Module } from "@nestjs/common";
import { FinancialModule } from "../financial/financial.module";
import { SportsModule } from "../sports/sports.module";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";

@Module({
  imports: [SportsModule, FinancialModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
