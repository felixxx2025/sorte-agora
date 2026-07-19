import { test, expect } from '@playwright/test';

async function loginAs(
  page: import('@playwright/test').Page,
  email: string,
  password: string,
) {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/home|dashboard/, { timeout: 20000 });
}

test.describe('VIP e Afiliados', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!process.env.E2E_API, 'Requer API (E2E_API=1)');
    await loginAs(page, 'demo@sorteagora.com', 'User1234!');
  });

  test('exibe página VIP', async ({ page }) => {
    await page.goto('/vip');
    await expect(page.getByRole('heading', { name: /VIP/i }).first()).toBeVisible({
      timeout: 15000,
    });
  });

  test('exibe página de afiliados', async ({ page }) => {
    await page.goto('/affiliates');
    await expect(
      page.getByRole('heading', { name: /Afiliad/i }).first(),
    ).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Perfil', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!process.env.E2E_API, 'Requer API (E2E_API=1)');
    await loginAs(page, 'demo@sorteagora.com', 'User1234!');
  });

  test('exibe perfil e seção LGPD', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.getByRole('heading', { name: /Perfil/i }).first()).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText(/LGPD|Privacidade|Exportar/i).first()).toBeVisible();
  });
});

test.describe('Admin', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!process.env.E2E_API, 'Requer API (E2E_API=1)');
    await loginAs(page, 'admin@sorteagora.com', 'Admin123!');
  });

  test('painel admin carrega visão geral', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: /Admin/i })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByRole('button', { name: /Visão geral|Apostas|Bônus/i }).first()).toBeVisible();
  });
});
