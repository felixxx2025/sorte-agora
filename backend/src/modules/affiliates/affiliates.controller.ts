import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { AffiliatesService } from './affiliates.service';
import { RegisterAffiliateDto } from './dto/register-affiliate.dto';

@Controller('affiliates')
@UseGuards(JwtAuthGuard)
export class AffiliatesController {
  constructor(private affiliatesService: AffiliatesService) {}

  @Post('register')
  registerAffiliate(@CurrentUser() user: any, @Body() registerAffiliateDto: RegisterAffiliateDto) {
    return this.affiliatesService.registerAffiliate(user.id, registerAffiliateDto);
  }

  @Get('dashboard')
  getDashboard(@CurrentUser() user: any) {
    return this.affiliatesService.getDashboard(user.id);
  }

  @Get('commissions')
  getCommissions(@CurrentUser() user: any) {
    return this.affiliatesService.getCommissions(user.id);
  }
}
