import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { FinancialService } from './financial.service';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';

@Controller('financial')
@UseGuards(JwtAuthGuard)
export class FinancialController {
  constructor(private financialService: FinancialService) {}

  @Get('balance')
  getBalance(@CurrentUser() user: any) {
    return this.financialService.getBalance(user.id);
  }

  @Post('deposit')
  createDeposit(@CurrentUser() user: any, @Body() depositDto: DepositDto) {
    return this.financialService.createDeposit(user.id, depositDto);
  }

  @Post('withdraw')
  createWithdraw(@CurrentUser() user: any, @Body() withdrawDto: WithdrawDto) {
    return this.financialService.createWithdraw(user.id, withdrawDto);
  }

  @Get('transactions')
  getTransactions(@CurrentUser() user: any) {
    return this.financialService.getTransactions(user.id);
  }
}
