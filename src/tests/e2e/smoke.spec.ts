import { test, expect } from '@playwright/test';

test('login page loads and has form fields', async ({ page }) => {
    await page.goto('/auth/login');

    // Verify title or key elements
    await expect(page.getByRole('heading', { name: 'Bienvenido' })).toBeVisible();
    await expect(page.getByPlaceholder('tucorreo@ejemplo.com')).toBeVisible();
    await expect(page.getByPlaceholder('••••••••')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Iniciar Sesión' })).toBeVisible();
});
