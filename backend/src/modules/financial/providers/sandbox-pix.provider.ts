import { Injectable } from "@nestjs/common";
import * as crypto from "crypto";
import {
  PixChargeRequest,
  PixChargeResult,
  PixPayoutRequest,
  PixPayoutResult,
  PixProvider,
  PixWebhookPayload,
} from "./pix-provider.interface";

/**
 * Provider sandbox — gera payload PIX simulado.
 * Em staging com webhook: PIX_AUTO_CONFIRM=false e POST /webhooks/pix.
 * Payout sandbox completa de imediato (sem PSP).
 */
@Injectable()
export class SandboxPixProvider implements PixProvider {
  readonly name = "sandbox";

  async createCharge(request: PixChargeRequest): Promise<PixChargeResult> {
    const externalId = `pix_${crypto.randomBytes(12).toString("hex")}`;
    const amount = Number(request.amount).toFixed(2);
    const pixCode = `00020126580014br.gov.bcb.pix0136${externalId}520400005303986540${amount}5802BR5925SORTE AGORA LTDA6009SAO PAULO62070503***6304`;

    return {
      externalId,
      pixCode,
      qrCode: `data:image/png;base64,${Buffer.from(pixCode).toString("base64")}`,
      providerRef: this.name,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    };
  }

  async createPayout(request: PixPayoutRequest): Promise<PixPayoutResult> {
    const externalId = `payout_${crypto.randomBytes(10).toString("hex")}`;
    return {
      externalId,
      providerRef: this.name,
      status: "COMPLETED",
      message: `Sandbox payout to ${request.pixKey}`,
    };
  }

  parseWebhook(
    body: unknown,
    _headers?: Record<string, string>,
  ): PixWebhookPayload | null {
    if (!body || typeof body !== "object") return null;
    const data = body as Record<string, unknown>;
    const externalId = String(data.externalId || data.txid || "");
    if (!externalId) return null;

    const statusRaw = String(data.status || "PAID").toUpperCase();
    const status =
      statusRaw === "EXPIRED"
        ? "EXPIRED"
        : statusRaw === "CANCELLED" || statusRaw === "CANCELED"
          ? "CANCELLED"
          : statusRaw === "FAILED"
            ? "FAILED"
            : "PAID";

    const kindRaw = String(data.kind || data.type || "").toUpperCase();
    const kind =
      kindRaw === "PAYOUT" || externalId.startsWith("payout_")
        ? "PAYOUT"
        : "CHARGE";

    return {
      externalId,
      status,
      kind,
      providerRef: String(data.providerRef || this.name),
      raw: body,
    };
  }
}
