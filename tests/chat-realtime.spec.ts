import { test, expect } from '@playwright/test';
const testCredentials = require('../test-credentials.json');

test.describe('Professional Portal - Real-time Chat', () => {

    test.beforeEach(async ({ page }) => {
        // Forward browser logs to terminal
        page.on('console', msg => {
            if (msg.type() === 'error' || msg.text().includes('useChat')) {
                console.log(`BROWSER [${msg.type()}]: ${msg.text()}`);
            }
        });

        // Login as Sarah (Agent)
        const agent = testCredentials.users.find((u: any) => u.role === 'agent');
        await page.goto('/login');
        await page.fill('input[type="email"]', agent.email);
        await page.fill('input[type="password"]', testCredentials.password);
        await page.click('button[type="submit"]', { force: true });
        await page.waitForURL('**/portal', { timeout: 30000 });
    });

    test('Agent can send a message and see it persist', async ({ page }) => {
        // Select "Sofia Garcia" (Lead)
        // Wait for pipeline loading
        await expect(page.getByText('Loading Pipeline...')).not.toBeVisible({ timeout: 15000 });

        const target = page.getByText('Sofia Garcia', { exact: false }).first();
        await target.click();
        await expect(page.getByText(`Managing: Sofia Garcia`, { exact: false })).toBeVisible({ timeout: 10000 });

        // Wait for connection (Room Resolution)
        // The red disconnected indicator should turn green/pulse
        // We can check for the input to be enabled
        const chatInput = page.getByPlaceholder('Message the Triad...');
        await expect(chatInput).toBeVisible();
        await expect(chatInput).toBeEnabled({ timeout: 10000 }); // Wait for room creation/fetch

        // Send a message with unique timestamp
        const testMessage = `Hello form E2E Test ${Date.now()}`;
        await chatInput.fill(testMessage);
        await chatInput.press('Enter');

        // Verify message appears in list
        await expect(page.getByText(testMessage)).toBeVisible();

        // Reload to verify persistence
        await page.reload();
        await expect(page.getByText('Syncing Roadmap...')).not.toBeVisible();
        // Ideally we select the client again if state is lost on reload, 
        // but default selection logic in Page.tsx might select first client (Sofia is first in seed?)
        // Let's explicitly select her again to be safe
        await page.getByText('Sofia Garcia', { exact: true }).click();

        await expect(page.getByText(testMessage)).toBeVisible({ timeout: 10000 });
    });
});
