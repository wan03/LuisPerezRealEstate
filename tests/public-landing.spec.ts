import { test, expect } from '@playwright/test';

test.describe('Public Landing Page & Tools', () => {
    test('Landing page renders Marketplace and PITI+ Calculator', async ({ page }) => {
        await page.goto('/');

        // Hero title
        await expect(page.locator('h1')).toContainText('OWN THE HIGHLANDS');

        // Marketplace
        await expect(page.locator('h2:has-text("Marketplace")')).toBeVisible();
        await expect(page.locator('text=5-Acre Mobile Home Lot')).toBeVisible();

        // Calculator exists and works
        await expect(page.getByRole('heading', { name: 'PITI+ Calculator' })).toBeVisible();

        const priceInput = page.locator('input[name="price"]');
        await priceInput.fill('250000');

        // Monthly total display
        await expect(page.locator('text=$1,896.93')).toBeVisible({ timeout: 10000 });
    });

    test('Public page does NOT show private components (Chat/Roadmap)', async ({ page }) => {
        await page.goto('/');

        // Triad Chat and Roadmap should NOT be present
        await expect(page.locator('text=Highlands Triad Chat')).not.toBeVisible();
        await expect(page.locator('text=Your Transaction Roadmap')).not.toBeVisible();
    });

    test('Navbar navigation works', async ({ page }) => {
        await page.goto('/');

        // Use getByRole for navbar links - first() because of mobile/desktop or page CTAs
        const eduLink = page.getByRole('link', { name: /Education Hub/i }).first();
        await eduLink.click();
        await expect(page).toHaveURL(/\/learn/);

        const loginLink = page.getByRole('link', { name: /Login/i }).first();
        await loginLink.click();
        await expect(page).toHaveURL(/\/login/);
    });
});
