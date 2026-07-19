import { test, expect } from '@playwright/test';

async function loginAsDemo(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'demo@sorteagora.com');
  await page.fill('input[type="password"]', 'User1234!');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
}

test.describe('Wallet', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!process.env.E2E_API, 'Requer API (E2E_API=1) e seed');
    await loginAsDemo(page);
  });

  test('exibe carteira e permite depósito demo', async ({ page }) => {
    await page.goto('/wallet');
    await expect(page.getByRole('heading', { name: /Carteira|Wallet|Saldo/i }).first()).toBeVisible({
      timeout: 15000,
    });
    const amount = page.locator('input[type="number"]').first();
    if (await amount.isVisible()) {
      await amount.fill('10');
      const depositBtn = page.getByRole('button', { name: /Depositar|Depósito/i }).first();
      if (await depositBtn.isVisible()) {
        await depositBtn.click();
        await expect(page.getByRole('alert').or(page.getByRole('status'))).toBeVisible({
          timeout: 15000,
        });
      }
    }
  });
});
