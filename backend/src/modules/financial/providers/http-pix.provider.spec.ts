import { ConfigService } from "@nestjs/config";
import { HttpPixProvider } from "./http-pix.provider";

describe("HttpPixProvider", () => {
  const config = {
    get: jest.fn((key: string) => {
      if (key === "PIX_WEBHOOK_SECRET") return "whsec_test";
      return undefined;
    }),
  } as unknown as ConfigService;

  const provider = new HttpPixProvider(config);

  it("creates local charge without PIX_API_BASE_URL", async () => {
    const charge = await provider.createCharge({ amount: 10, userId: "u1" });
    expect(charge.externalId).toMatch(/^pix_http_/);
    expect(charge.providerRef).toBe("http");
  });

  it("createPayout local returns PROCESSING", async () => {
    const payout = await provider.createPayout({
      amount: 10,
      userId: "u1",
      pixKey: "k",
      transactionId: "t1",
    });
    expect(payout.status).toBe("PROCESSING");
    expect(payout.externalId).toMatch(/^payout_/);
  });

  it("verifies HMAC signature", () => {
    const body = { externalId: "pix_1", status: "PAID" };
    const crypto = require("crypto");
    const sig = crypto
      .createHmac("sha256", "whsec_test")
      .update(JSON.stringify(body))
      .digest("hex");
    expect(provider.verifyWebhook(body, { "x-signature": sig })).toBe(true);
    expect(provider.verifyWebhook(body, { "x-signature": "bad" })).toBe(false);
  });

  it("accepts x-webhook-secret fallback", () => {
    expect(
      provider.verifyWebhook(
        { externalId: "x" },
        { "x-webhook-secret": "whsec_test" },
      ),
    ).toBe(true);
  });
});
