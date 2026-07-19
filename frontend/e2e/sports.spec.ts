import { test, expect } from '@playwright/test';

async function loginAsDemo(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'demo@sorteagora.com');
  await page.fill('input[type="password"]', 'User1234!');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/home|dashboard/, { timeout: 15000 });
}

test.describe('Sports', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!process.env.E2E_API, 'Requer API (E2E_API=1) e seed');
    await loginAsDemo(page);
  });

  test('lista eventos esportivos', async ({ page }) => {
    await page.goto('/sports');
    await expect(page.getByRole('heading', { name: 'Apostas Esportivas' })).toBeVisible();
    await expect(
      page.getByText(/Evento|Nenhum evento|AO VIVO|Todos os Eventos/i).first(),
    ).toBeVisible({ timeout: 15000 });
  });
});
