import { test, expect } from '@playwright/test';
import testData from '../test-credentials.json';

test.describe('Education Hub & Content', () => {

    /*
    // Mocking removed - can't set cookie easily for auth in simple test without logging in
    // For this test, if we want to test "Article CTA", we need a logged in user.
    // Or we can just log in manually in that specific test.
    */
    const client = { email: 'robert.t@gmail.com' }; // Use client email

    test('Knowledge Base listing and article routing', async ({ page }) => {
        await page.goto('/learn');

        // Title and categories
        await expect(page.locator('h1')).toContainText('Knowledge Base');
        await expect(page.locator('text=Financing').first()).toBeVisible();

        // Article cards
        await expect(page.locator('text=The Florida CDD Fee Guide')).toBeVisible();

        // Navigate to article
        await page.click('text=The Florida CDD Fee Guide');
        await page.waitForURL(/\/learn\/cdd-guide/);

        // Verify content rendered
        await expect(page.getByRole('heading', { name: /The Florida CDD Fee Guide/i })).toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=Understanding CDD Fees')).toBeVisible();
    });

    test('Article page has CTA to Dashboard', async ({ page }) => {
        // Login first
        await page.goto('/login');
        await page.fill('input[type="email"]', testData.users.find(u => u.role === 'client')!.email);
        await page.fill('input[type="password"]', testData.password);
        await page.click('button[type="submit"]', { force: true });
        await page.waitForURL('/dashboard', { timeout: 30000 });

        await page.goto('/learn/cdd-guide');

        const cta = page.getByRole('link', { name: /Deploy Your Roadmap/i });
        await expect(cta).toBeVisible({ timeout: 10000 });
        await cta.click();
        await expect(page).toHaveURL(/\/dashboard/);
    });
});
