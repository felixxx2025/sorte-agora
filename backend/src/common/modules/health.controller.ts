import {
  Controller,
  Get,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { Public } from '../decorators/public.decorator';
import { PrismaService } from '../../database/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) { }

  @Public()
  @Get()
  async check(@Res({ passthrough: true }) res: Response) {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch {
      res.status(HttpStatus.SERVICE_UNAVAILABLE);
      return {
        status: 'error',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
