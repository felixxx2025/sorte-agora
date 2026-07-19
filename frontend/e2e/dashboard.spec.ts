import { test, expect } from '@playwright/test';

async function loginAsDemo(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'demo@sorteagora.com');
  await page.fill('input[type="password"]', 'User1234!');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/home|dashboard/, { timeout: 15000 });
}

test.describe('Home autenticada', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!process.env.E2E_API, 'Requer API (E2E_API=1) e seed demo');
    await loginAsDemo(page);
  });

  test('exibe saldo e atalhos do lobby', async ({ page }) => {
    await expect(page.getByText(/Saldo/i).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('link', { name: /Cassino/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Carteira/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Crash/i }).first()).toBeVisible();
  });
});
