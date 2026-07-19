import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { UsersService } from './users.service';
import { SubmitKycDto } from './dto/submit-kyc.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return this.usersService.getProfile(user.id);
  }

  @Put('profile')
  updateProfile(@CurrentUser() user: any, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateProfile(user.id, updateUserDto);
  }

  @Post('kyc')
  submitKyc(@CurrentUser() user: any, @Body() dto: SubmitKycDto) {
    return this.usersService.submitKyc(user.id, dto);
  }

  @Get('kyc')
  getKycStatus(@CurrentUser() user: any) {
    return this.usersService.getKycStatus(user.id);
  }
}
