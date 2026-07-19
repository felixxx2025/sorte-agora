import { test, expect } from '@playwright/test';

async function loginAsDemo(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'demo@sorteagora.com');
  await page.fill('input[type="password"]', 'User1234!');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
}

test.describe('Dashboard autenticado', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!process.env.E2E_API, 'Requer API (E2E_API=1) e seed demo');
    await loginAsDemo(page);
  });

  test('exibe saldo e links principais', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText(/Saldo/i).first()).toBeVisible();
    const nav = page.getByRole('navigation');
    await expect(nav.getByRole('link', { name: 'Cassino' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Carteira' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'VIP' })).toBeVisible();
  });
});
