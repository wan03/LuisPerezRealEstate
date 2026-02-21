import { test, expect } from '@playwright/test';
import testData from '../test-credentials.json';

test.describe('Client Dashboard Workflow', () => {
    const client = testData.users.find(u => u.role === 'client')!;

    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[type="email"]', client.email);
        await page.fill('input[type="password"]', testData.password);
        await page.click('button[type="submit"]', { force: true });
        await page.waitForURL('/dashboard', { timeout: 30000 });
    });

    test('Dashboard displays Triad Chat, Roadmap, and Document Vault', async ({ page }) => {
        // Chat
        await expect(page.locator('text=Highlands Triad Chat')).toBeVisible();

        // Roadmap (Read-only for clients)
        await expect(page.locator('text=Transaction Roadmap')).toBeVisible();
        await expect(page.locator('text=In Progress').first()).toBeVisible();

        // Document Vault
        await expect(page.locator('text=Document Vault')).toBeVisible();
        await expect(page.locator('text=Your Files')).toBeVisible();
    });

    test('Roadmap contains links to educational content', async ({ page }) => {
        // Click "Learn More" on a milestone
        const learnMoreLinks = page.locator('text=Learn More');
        await expect(learnMoreLinks.first()).toBeVisible();

        // Test a specific link mapping
        await page.click('text=Learn More >> nth=0'); // Should be Discovery Guide
        await expect(page).toHaveURL(/\/learn\/discovery-guide/);
    });
});
