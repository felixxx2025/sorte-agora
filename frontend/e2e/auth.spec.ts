import { test, expect } from '@playwright/test';

test.describe('Autenticação', () => {
  test('deve carregar a página de login', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    await expect(page).toHaveTitle(/SORTE AGORA/);
    await expect(page.locator('form')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('h1')).toContainText('Entrar');
  });

  test('deve mostrar erro com credenciais inválidas', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.locator('input[type="email"]').waitFor({ state: 'visible', timeout: 15000 });
    await page.fill('input[type="email"]', 'invalid@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 15000 });
  });

  test('deve entrar com usuário demo e ir ao dashboard', async ({ page }) => {
    test.skip(!process.env.E2E_API, 'Requer API (E2E_API=1) e seed demo');
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'demo@sorteagora.com');
    await page.fill('input[type="password"]', 'User1234!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/home|dashboard/, { timeout: 20000 });
  });
});
