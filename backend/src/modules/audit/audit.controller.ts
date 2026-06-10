import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditService } from './audit.service';

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get('user/:userId')
  getUserLogs(@Query('userId') userId: string, @Query('limit') limit?: string) {
    return this.auditService.getUserLogs(userId, limit ? parseInt(limit) : 50);
  }

  @Get('action/:action')
  getLogsByAction(@Query('action') action: string, @Query('limit') limit?: string) {
    return this.auditService.getLogsByAction(action, limit ? parseInt(limit) : 50);
  }
}
