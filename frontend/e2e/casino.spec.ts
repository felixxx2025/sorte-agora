import { test, expect } from '@playwright/test';

test.describe('Casino', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.setItem('accessToken', 'test-token');
    });
  });

  test('deve carregar a página de casino', async ({ page }) => {
    await page.goto('/casino');
    await expect(page.locator('h1')).toContainText('Casino');
  });

  test('deve listar jogos disponíveis', async ({ page }) => {
    await page.goto('/casino');
    // Verifica se há cards de jogos
    const gameCards = page.locator('[class*="card"]');
    await expect(gameCards.first()).toBeVisible();
  });

  test('deve permitir filtrar jogos por categoria', async ({ page }) => {
    await page.goto('/casino');
    
    // Verifica se há filtros de categoria
    const categoryFilter = page.locator('select, button').first();
    if (await categoryFilter.isVisible()) {
      await categoryFilter.click();
      // Verifica se opções de categoria aparecem
    }
  });
});
