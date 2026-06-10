import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Simula login armazenando token no localStorage
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.setItem('accessToken', 'test-token');
      localStorage.setItem('refreshToken', 'test-refresh');
    });
  });

  test('deve carregar o dashboard com autenticação', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('deve mostrar saldo do usuário', async ({ page }) => {
    await page.goto('/dashboard');
    // Verifica se elementos de saldo estão presentes
    await expect(page.locator('text=/saldo/i')).toBeVisible();
  });

  test('deve ter navegação para outras páginas', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verifica links de navegação
    const casinoLink = page.locator('a[href="/casino"]');
    const walletLink = page.locator('a[href="/wallet"]');
    const vipLink = page.locator('a[href="/vip"]');
    
    await expect(casinoLink).toBeVisible();
    await expect(walletLink).toBeVisible();
    await expect(vipLink).toBeVisible();
  });
});
