export interface PixChargeRequest {
  amount: number;
  userId: string;
  pixKey?: string;
}

export interface PixChargeResult {
  externalId: string;
  pixCode: string;
  qrCode: string;
  providerRef?: string;
  expiresAt: Date;
}

export interface PixPayoutRequest {
  amount: number;
  userId: string;
  pixKey: string;
  transactionId: string;
}

export interface PixPayoutResult {
  externalId: string;
  providerRef?: string;
  /** COMPLETED = PSP já pagou; PROCESSING = aguarda webhook */
  status: "PROCESSING" | "COMPLETED" | "FAILED";
  message?: string;
}

export interface PixWebhookPayload {
  externalId: string;
  status: "PAID" | "EXPIRED" | "CANCELLED" | "FAILED";
  kind?: "CHARGE" | "PAYOUT";
  providerRef?: string;
  raw?: unknown;
}

export interface PixProvider {
  readonly name: string;
  createCharge(request: PixChargeRequest): Promise<PixChargeResult>;
  createPayout(request: PixPayoutRequest): Promise<PixPayoutResult>;
  parseWebhook(
    body: unknown,
    headers?: Record<string, string>,
  ): PixWebhookPayload | null;
  /** Retorna false se assinatura inválida; true se ok ou não aplicável */
  verifyWebhook?(
    body: unknown,
    headers?: Record<string, string>,
  ): boolean;
}

export const PIX_PROVIDER = Symbol("PIX_PROVIDER");
