import { SandboxPixProvider } from "./sandbox-pix.provider";

describe("SandboxPixProvider", () => {
  const provider = new SandboxPixProvider();

  it("creates charge with externalId", async () => {
    const charge = await provider.createCharge({ amount: 50, userId: "u1" });
    expect(charge.externalId).toMatch(/^pix_/);
    expect(charge.pixCode).toContain("br.gov.bcb.pix");
    expect(charge.qrCode).toMatch(/^data:image/);
  });

  it("parses webhook PAID", () => {
    const payload = provider.parseWebhook({
      externalId: "pix_abc",
      status: "PAID",
    });
    expect(payload).toEqual(
      expect.objectContaining({ externalId: "pix_abc", status: "PAID" }),
    );
  });

  it("creates sandbox payout as COMPLETED", async () => {
    const payout = await provider.createPayout({
      amount: 20,
      userId: "u1",
      pixKey: "key",
      transactionId: "tx1",
    });
    expect(payout.status).toBe("COMPLETED");
    expect(payout.externalId).toMatch(/^payout_/);
  });

  it("parses payout webhook kind", () => {
    const payload = provider.parseWebhook({
      externalId: "payout_abc",
      status: "PAID",
      kind: "PAYOUT",
    });
    expect(payload?.kind).toBe("PAYOUT");
  });
});
