import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Public } from '../../common/decorators/public.decorator';
import { FinancialService } from './financial.service';
import { SandboxPixProvider } from './providers/sandbox-pix.provider';

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private financialService: FinancialService,
    private pixProvider: SandboxPixProvider,
    private config: ConfigService,
  ) {}

  /**
   * Webhook PIX — público. Body: { externalId, status: "PAID" }.
   * Header opcional: x-webhook-secret = PIX_WEBHOOK_SECRET
   */
  @Public()
  @Post('pix')
  async pixWebhook(
    @Body() body: unknown,
    @Headers() headers: Record<string, string>,
  ) {
    const secret = this.config.get('PIX_WEBHOOK_SECRET');
    if (secret) {
      const provided =
        headers['x-webhook-secret'] || headers['X-Webhook-Secret'];
      if (provided !== secret) {
        throw new UnauthorizedException('Invalid webhook secret');
      }
    }

    const payload = this.pixProvider.parseWebhook(body, headers);
    if (!payload?.externalId) {
      throw new BadRequestException('Invalid webhook payload');
    }

    if (payload.status !== 'PAID') {
      return {
        ok: true,
        ignored: true,
        status: payload.status,
        externalId: payload.externalId,
      };
    }

    const result = await this.financialService.confirmByExternalId(
      payload.externalId,
    );
    return { ok: true, ...result };
  }
}
