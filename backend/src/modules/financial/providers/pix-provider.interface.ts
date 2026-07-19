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

export interface PixWebhookPayload {
  externalId: string;
  status: 'PAID' | 'EXPIRED' | 'CANCELLED';
  providerRef?: string;
  raw?: unknown;
}

export interface PixProvider {
  readonly name: string;
  createCharge(request: PixChargeRequest): Promise<PixChargeResult>;
  parseWebhook(
    body: unknown,
    headers?: Record<string, string>,
  ): PixWebhookPayload | null;
}

export const PIX_PROVIDER = Symbol('PIX_PROVIDER');
