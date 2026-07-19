import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Inject,
  Post,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Public } from "../../common/decorators/public.decorator";
import { FinancialService } from "./financial.service";
import { PIX_PROVIDER, PixProvider } from "./providers/pix-provider.interface";

@Controller("webhooks")
export class WebhooksController {
  constructor(
    private financialService: FinancialService,
    @Inject(PIX_PROVIDER) private pixProvider: PixProvider,
    private config: ConfigService,
  ) {}

  /**
   * Webhook PIX — público.
   * Charge: { externalId, status: "PAID" }
   * Payout: { externalId, status: "PAID"|"FAILED", kind: "PAYOUT" }
   * Auth: x-webhook-secret ou x-signature (HMAC) via provider.verifyWebhook
   */
  @Public()
  @Post("pix")
  async pixWebhook(
    @Body() body: unknown,
    @Headers() headers: Record<string, string>,
  ) {
    if (this.pixProvider.verifyWebhook) {
      if (!this.pixProvider.verifyWebhook(body, headers)) {
        throw new UnauthorizedException("Invalid webhook signature");
      }
    } else {
      const secret = this.config.get("PIX_WEBHOOK_SECRET");
      if (secret) {
        const provided =
          headers["x-webhook-secret"] || headers["X-Webhook-Secret"];
        if (provided !== secret) {
          throw new UnauthorizedException("Invalid webhook secret");
        }
      }
    }

    const payload = this.pixProvider.parseWebhook(body, headers);
    if (!payload?.externalId) {
      throw new BadRequestException("Invalid webhook payload");
    }

    if (payload.kind === "PAYOUT") {
      if (payload.status === "PAID") {
        const result = await this.financialService.confirmPayoutByExternalId(
          payload.externalId,
          "COMPLETED",
        );
        return { ok: true, kind: "PAYOUT", ...result };
      }
      if (payload.status === "FAILED") {
        const result = await this.financialService.confirmPayoutByExternalId(
          payload.externalId,
          "FAILED",
        );
        return { ok: true, kind: "PAYOUT", ...result };
      }
      return {
        ok: true,
        ignored: true,
        kind: "PAYOUT",
        status: payload.status,
        externalId: payload.externalId,
      };
    }

    if (payload.status !== "PAID") {
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
    return { ok: true, kind: "CHARGE", ...result };
  }
}
