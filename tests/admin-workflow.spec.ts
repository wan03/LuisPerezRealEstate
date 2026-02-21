import { test, expect } from '@playwright/test';
import testData from '../test-credentials.json';

test.describe('Admin Console Workflow', () => {
    const admin = testData.users.find(u => u.role === 'admin')!;

    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[type="email"]', admin.email);
        await page.fill('input[type="password"]', testData.password);
        await page.click('button[type="submit"]', { force: true });

        await page.waitForURL('/admin', { timeout: 30000 });
    });

    test('Admin console displays operational stats', async ({ page }) => {
        await expect(page.locator('text=Admin Registry')).toBeVisible();
        await expect(page.locator('text=System-Wide Overview')).toBeVisible();
        await expect(page.locator('text=Active Pipeline')).toBeVisible();
    });

    test('Admin can navigate to settings (placeholder)', async ({ page }) => {
        // Look for the "Invite User" button as a proxy for interactivity
        const inviteBtn = page.locator('button').filter({ hasText: 'Invite User' });
        await expect(inviteBtn).toBeVisible();
        await inviteBtn.click();
    });
});
