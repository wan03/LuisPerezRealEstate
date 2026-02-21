import { test, expect } from '@playwright/test';
import testData from '../test-credentials.json';

test.describe('Professional Portal Workflow', () => {
    const agent = testData.users.find(u => u.role === 'agent')!;

    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[type="email"]', agent.email);
        await page.fill('input[type="password"]', testData.password);
        await page.click('button[type="submit"]', { force: true });
        await page.waitForURL('/portal', { timeout: 30000 });
    });

    test('Agent can view client list and manage milestones', async ({ page }) => {
        // Client List
        await expect(page.locator('text=Active Pipeline')).toBeVisible();
        await expect(page.locator('text=Robert Thompson').first()).toBeVisible({ timeout: 15000 });

        // Select Client
        await page.click('text=Robert Thompson >> nth=0');
        await expect(page.locator('text=Managing: Robert Thompson')).toBeVisible();

        // Verify Roadmap is editable (shows editing mode badge)
        await expect(page.locator('text=Editing Mode: agent')).toBeVisible();

        // Check if we have progress indicators
        await expect(page.locator('text=In Progress')).toBeVisible();
    });
});
