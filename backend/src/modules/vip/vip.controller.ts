import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { VipService } from './vip.service';

@Controller('vip')
@UseGuards(JwtAuthGuard)
export class VipController {
  constructor(private vipService: VipService) {}

  @Get('status')
  getVipStatus(@CurrentUser() user: any) {
    return this.vipService.getVipStatus(user.id);
  }

  @Get('levels')
  getVipLevels() {
    return this.vipService.getVipLevels();
  }

  @Get('missions')
  getMissions(@CurrentUser() user: any) {
    return this.vipService.getMissions(user.id);
  }
}
