import { Controller, Get, Header } from '@nestjs/common';
import { Public } from '../decorators/public.decorator';
import { PrometheusService } from './prometheus.service';

@Controller('metrics')
export class PrometheusController {
  constructor(private readonly prometheusService: PrometheusService) {}

  @Public()
  @Get()
  @Header('Content-Type', 'text/plain')
  async getMetrics() {
    const metrics = await this.prometheusService.getMetrics();
    return metrics;
  }
}
