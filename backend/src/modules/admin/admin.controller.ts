import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from "@nestjs/common";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { AdminService } from "./admin.service";
import { BanUserDto } from "./dto/ban-user.dto";
import { UpdateBonusDto } from "./dto/update-bonus.dto";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get("dashboard")
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get("users")
  getUsers() {
    return this.adminService.getUsers();
  }

  @Put("users/:id/ban")
  banUser(@Param("id") id: string, @Body() banUserDto: BanUserDto) {
    return this.adminService.banUser(id, banUserDto);
  }

  @Put("users/:id/unban")
  unbanUser(@Param("id") id: string) {
    return this.adminService.unbanUser(id);
  }

  @Get("financial/transactions")
  getTransactions() {
    return this.adminService.getTransactions();
  }

  @Get("financial/withdrawals")
  getPendingWithdrawals() {
    return this.adminService.getPendingWithdrawals();
  }

  @Put("financial/withdrawals/:id/approve")
  approveWithdrawal(@Param("id") id: string) {
    return this.adminService.approveWithdrawal(id);
  }

  @Put("financial/withdrawals/:id/reject")
  rejectWithdrawal(@Param("id") id: string) {
    return this.adminService.rejectWithdrawal(id);
  }

  @Get("reports")
  getReports() {
    return this.adminService.getReports();
  }

  @Get("kyc")
  listPendingKyc() {
    return this.adminService.listPendingKyc();
  }

  @Put("kyc/:id/review")
  reviewKyc(
    @Param("id") id: string,
    @Request() req: any,
    @Body() body: { decision: "APPROVED" | "REJECTED"; reason?: string },
  ) {
    return this.adminService.reviewKyc(
      id,
      body.decision,
      req.user.id,
      body.reason,
    );
  }

  @Get("sports/bets/pending")
  listPendingSportsBets() {
    return this.adminService.listPendingSportsBets();
  }

  @Put("sports/bets/:id/settle")
  settleBet(@Param("id") id: string, @Body() body: { result: "WON" | "LOST" }) {
    return this.adminService.settleSportsBet(id, body.result);
  }

  @Get("bonuses")
  listBonuses() {
    return this.adminService.listBonuses();
  }

  @Post("bonuses")
  createBonus(@Body() createBonusDto: any) {
    return this.adminService.createBonus(createBonusDto);
  }

  @Put("bonuses/:id")
  updateBonus(@Param("id") id: string, @Body() updateBonusDto: UpdateBonusDto) {
    return this.adminService.updateBonus(id, updateBonusDto);
  }

  @Delete("bonuses/:id")
  deleteBonus(@Param("id") id: string) {
    return this.adminService.deleteBonus(id);
  }
}
