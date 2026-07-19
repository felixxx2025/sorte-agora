import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance } from "axios";
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
 * Adapter HTTP genérico para PSP PIX (MercadoPago/Pagar.me-like).
 *
 * Env:
 * - PIX_API_BASE_URL — base da API do PSP
 * - PIX_API_KEY / PIX_ACCESS_TOKEN — Bearer
 * - PIX_WEBHOOK_SECRET — HMAC (header x-signature) ou shared secret
 * - PIX_HTTP_SYNC_PAYOUT=true — trata payout HTTP 200 como COMPLETED
 *
 * Sem PIX_API_BASE_URL: modo "http-local" (charge/payout locais + webhook HMAC),
 * útil para staging sem PSP real ainda configurado.
 */
@Injectable()
export class HttpPixProvider implements PixProvider {
  readonly name = "http";
  private readonly logger = new Logger(HttpPixProvider.name);
  private readonly http: AxiosInstance | null;
  private readonly baseUrl: string;

  constructor(private config: ConfigService) {
    this.baseUrl = (this.config.get("PIX_API_BASE_URL") || "").replace(
      /\/$/,
      "",
    );
    const token =
      this.config.get("PIX_ACCESS_TOKEN") ||
      this.config.get("PIX_API_KEY") ||
      "";

    this.http = this.baseUrl
      ? axios.create({
          baseURL: this.baseUrl,
          timeout: 20000,
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        })
      : null;

    if (!this.http) {
      this.logger.warn(
        "PIX_API_BASE_URL não definido — HttpPixProvider em modo http-local (sem PSP remoto)",
      );
    }
  }

  async createCharge(request: PixChargeRequest): Promise<PixChargeResult> {
    if (!this.http) {
      return this.localCharge(request);
    }

    try {
      const { data } = await this.http.post("/v1/pix/charges", {
        amount: Number(request.amount),
        userId: request.userId,
        pixKey: request.pixKey,
        currency: "BRL",
      });

      const externalId = String(
        data.externalId || data.id || data.txid || "",
      );
      if (!externalId) {
        throw new BadGatewayException("PSP charge missing externalId");
      }

      const pixCode = String(
        data.pixCode || data.qr_code || data.copyPaste || "",
      );
      const qrCode = String(
        data.qrCode ||
          data.qr_code_base64 ||
          (pixCode
            ? `data:image/png;base64,${Buffer.from(pixCode).toString("base64")}`
            : ""),
      );

      return {
        externalId,
        pixCode: pixCode || `PIX:${externalId}`,
        qrCode: qrCode || `data:image/png;base64,`,
        providerRef: String(data.providerRef || this.name),
        expiresAt: data.expiresAt
          ? new Date(data.expiresAt)
          : new Date(Date.now() + 15 * 60 * 1000),
      };
    } catch (err: any) {
      if (err instanceof BadGatewayException) throw err;
      this.logger.error(`PIX charge failed: ${err?.message}`);
      throw new ServiceUnavailableException(
        "PIX provider unavailable for charge",
      );
    }
  }

  async createPayout(request: PixPayoutRequest): Promise<PixPayoutResult> {
    if (!this.http) {
      const externalId = `payout_${crypto.randomBytes(10).toString("hex")}`;
      return {
        externalId,
        providerRef: this.name,
        status: "PROCESSING",
        message: "http-local payout — confirme via webhook",
      };
    }

    try {
      const { data } = await this.http.post("/v1/pix/payouts", {
        amount: Number(request.amount),
        userId: request.userId,
        pixKey: request.pixKey,
        transactionId: request.transactionId,
        currency: "BRL",
      });

      const externalId = String(
        data.externalId || data.id || data.txid || "",
      );
      if (!externalId) {
        throw new BadGatewayException("PSP payout missing externalId");
      }

      const statusRaw = String(data.status || "PROCESSING").toUpperCase();
      const sync =
        this.config.get("PIX_HTTP_SYNC_PAYOUT") === "true" ||
        statusRaw === "PAID" ||
        statusRaw === "COMPLETED";

      return {
        externalId,
        providerRef: String(data.providerRef || this.name),
        status: sync
          ? "COMPLETED"
          : statusRaw === "FAILED"
            ? "FAILED"
            : "PROCESSING",
        message: data.message,
      };
    } catch (err: any) {
      if (err instanceof BadGatewayException) throw err;
      this.logger.error(`PIX payout failed: ${err?.message}`);
      return {
        externalId: `payout_fail_${request.transactionId}`,
        providerRef: this.name,
        status: "FAILED",
        message: err?.message || "PSP payout failed",
      };
    }
  }

  verifyWebhook(body: unknown, headers?: Record<string, string>): boolean {
    const secret = this.config.get("PIX_WEBHOOK_SECRET");
    if (!secret) return true;

    const sig =
      headers?.["x-signature"] ||
      headers?.["X-Signature"] ||
      headers?.["x-hub-signature-256"] ||
      "";

    if (!sig) {
      // fallback: shared secret header (compat D1)
      const shared =
        headers?.["x-webhook-secret"] || headers?.["X-Webhook-Secret"];
      return shared === secret;
    }

    const raw =
      typeof body === "string" ? body : JSON.stringify(body ?? {});
    const expected = crypto
      .createHmac("sha256", secret)
      .update(raw)
      .digest("hex");
    const provided = sig.replace(/^sha256=/i, "");
    try {
      return crypto.timingSafeEqual(
        Buffer.from(expected),
        Buffer.from(provided),
      );
    } catch {
      return false;
    }
  }

  parseWebhook(
    body: unknown,
    _headers?: Record<string, string>,
  ): PixWebhookPayload | null {
    if (!body || typeof body !== "object") return null;
    const data = body as Record<string, unknown>;
    const externalId = String(
      data.externalId || data.txid || data.id || "",
    );
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
      kindRaw === "PAYOUT" ||
      kindRaw === "WITHDRAWAL" ||
      externalId.startsWith("payout_")
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

  private async localCharge(
    request: PixChargeRequest,
  ): Promise<PixChargeResult> {
    const externalId = `pix_http_${crypto.randomBytes(10).toString("hex")}`;
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
}
