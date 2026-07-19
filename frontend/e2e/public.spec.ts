import { test, expect } from '@playwright/test';

test.describe('Páginas públicas', () => {
  test('carrega termos de uso', async ({ page }) => {
    await page.goto('/terms', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /Termos/i })).toBeVisible({
      timeout: 15000,
    });
  });

  test('carrega política de privacidade', async ({ page }) => {
    await page.goto('/privacy', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /Privacidade|LGPD/i })).toBeVisible({
      timeout: 15000,
    });
  });

  test('carrega página de registro', async ({ page }) => {
    await page.goto('/register', { waitUntil: 'networkidle' });
    await expect(page.locator('form')).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('link', { name: /Termos/i })).toBeVisible();
  });

  test('carrega forgot-password', async ({ page }) => {
    await page.goto('/forgot-password', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('form')).toBeVisible({ timeout: 15000 });
  });
});
