import { SandboxPixProvider } from './sandbox-pix.provider';

describe('SandboxPixProvider', () => {
  const provider = new SandboxPixProvider();

  it('creates charge with externalId', async () => {
    const charge = await provider.createCharge({ amount: 50, userId: 'u1' });
    expect(charge.externalId).toMatch(/^pix_/);
    expect(charge.pixCode).toContain('br.gov.bcb.pix');
    expect(charge.qrCode).toMatch(/^data:image/);
  });

  it('parses webhook PAID', () => {
    const payload = provider.parseWebhook({ externalId: 'pix_abc', status: 'PAID' });
    expect(payload).toEqual(
      expect.objectContaining({ externalId: 'pix_abc', status: 'PAID' }),
    );
  });

  it('returns null for invalid body', () => {
    expect(provider.parseWebhook(null)).toBeNull();
  });
});
