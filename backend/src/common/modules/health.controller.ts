import {
  Controller,
  Get,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../../database/prisma.service';
import { Public } from '../decorators/public.decorator';
import { FeatureFlagsService } from '../services/feature-flags.service';

@Controller('health')
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private features: FeatureFlagsService,
  ) { }

  @Public()
  @Get()
  async check(@Res({ passthrough: true }) res: Response) {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        database: 'connected',
        features: this.features.snapshot(),
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
