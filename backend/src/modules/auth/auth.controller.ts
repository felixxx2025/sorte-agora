import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { EnableMfaDto } from './dto/enable-mfa.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyMfaDto } from './dto/verify-mfa.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req, @Body() loginDto: LoginDto) {
    return this.authService.login(req.user);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('refresh')
  async refresh(@Request() req) {
    return this.authService.refresh(req.user);
  }

  @Post('logout')
  async logout(@Request() req) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.authService.logout(req.user, token);
  }

  @Post('mfa/generate')
  async generateMfaSecret(@Request() req) {
    return this.authService.generateMfaSecret(req.user.id);
  }

  @Post('mfa/enable')
  async enableMfa(@Request() req, @Body() enableMfaDto: EnableMfaDto) {
    return this.authService.enableMfa(req.user.id, enableMfaDto);
  }

  @Post('mfa/disable')
  async disableMfa(@Request() req, @Body() verifyMfaDto: VerifyMfaDto) {
    return this.authService.disableMfa(req.user.id, verifyMfaDto);
  }

  @Post('mfa/verify')
  async verifyMfa(@Request() req, @Body() verifyMfaDto: VerifyMfaDto) {
    return this.authService.verifyMfa(req.user.id, verifyMfaDto);
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
