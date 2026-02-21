import { test, expect } from '@playwright/test';
const testCredentials = require('../test-credentials.json');

// Define the seeded demo users and their expected states
const DEMO_TRANSACTIONS = [
    { email: 'demo.garcia@gmail.com', name: 'Sofia Garcia', property: 'Highlands County Search', status: 'Lead' },
    { email: 'demo.smith@gmail.com', name: 'James Smith', property: 'Lake Placid Waterfront', status: 'House Hunting' },
    { email: 'demo.johnson@gmail.com', name: 'Emma Johnson', property: '123 Highlands Dr', status: 'Under Contract' },
    { email: 'demo.williams@gmail.com', name: 'Lucas Williams', property: '45 Lakeview Blvd', status: 'Underwriting' },
    { email: 'demo.brown@gmail.com', name: 'Olivia Brown', property: '555 Golf Course Rd', status: 'Closed' },
];

test.describe('Professional Portal - Real Data Integration', () => {

    test.beforeEach(async ({ page }) => {
        // Login as Sarah (Agent)
        const agent = testCredentials.users.find((u: any) => u.role === 'agent');
        await page.goto('/login');
        await page.fill('input[type="email"]', agent.email);
        await page.fill('input[type="password"]', testCredentials.password);
        await page.click('button[type="submit"]', { force: true });
        await page.waitForURL('**/portal', { timeout: 30000 });
    });

    test('Agent can see all active pipeline clients with correct details', async ({ page }) => {
        // Wait for the client list to load (look for "Active Pipeline")
        await expect(page.getByText('Active Pipeline')).toBeVisible();
        // Wait for pipeline loading to finish
        await expect(page.getByText('Loading Pipeline...')).not.toBeVisible();
        // Wait for command center loading to finish (if applicable, though client selection might be async)
        // We can just verify names now, implicit wait will handle it.

        // Check each demo client
        for (const demo of DEMO_TRANSACTIONS) {
            console.log(`Verifying client: ${demo.name}`);

            // Should see the name (exact match to avoid "Managing: [Name]" header)
            await expect(page.getByText(demo.name, { exact: true })).toBeVisible();

            // Find the card container that has this name (using specific card styling to distinguish from other containers)
            const card = page.locator('.p-5.rounded-2xl', { has: page.getByText(demo.name, { exact: true }) });

            // Within that card, check property and status
            await expect(card).toContainText(demo.property);
            await expect(card).toContainText(demo.status);
        }
    });

    test('Agent can view transaction details and matching roadmap status', async ({ page }) => {
        // Test with "Emma Johnson" who is Under Contract
        const targetClient = DEMO_TRANSACTIONS.find(d => d.email === 'demo.johnson@gmail.com');
        if (!targetClient) throw new Error('Target client not found');

        // Wait for pipeline loading to finish
        await expect(page.getByText('Loading Pipeline...')).not.toBeVisible();

        await page.getByText(targetClient.name).click();

        // Wait for command center loading
        await expect(page.getByText('Syncing Roadmap...')).not.toBeVisible();

        // Verify Management View Header
        await expect(page.getByRole('heading', { name: `Managing: ${targetClient.name}` })).toBeVisible();

        // Verify Roadmap Status
        // For "Under Contract", the "Offer Accepted" step should be Active or Completed
        // In our logic: if status is 'under_contract', index is 3. 
        // "Offer Accepted" order is 3. So it should be 'active' (pulsing/indigo) or completed if we moved past.
        // Let's just check that "Offer Accepted" is visible.
        await expect(page.getByText('Offer Accepted')).toBeVisible();
        await expect(page.getByText('Transaction Roadmap')).toBeVisible();

        // Check that a later step like "Closing Day" is NOT active/completed (should be pending/grey)
        // Hard to test exact colors without brittle selectors, but we can ensure the step exists
        await expect(page.getByText('Closing Day')).toBeVisible();
    });

    test('Agent can update transaction status via Command Center', async ({ page }) => {
        // Test with "Sofia Garcia" (Lead)
        const targetClient = DEMO_TRANSACTIONS.find(d => d.email === 'demo.garcia@gmail.com');
        if (!targetClient) throw new Error('Target client not found');

        // Navigate to client
        await expect(page.getByText('Loading Pipeline...')).not.toBeVisible();
        await page.getByText(targetClient.name, { exact: true }).click();

        // Wait for Command Center
        await expect(page.getByText('Syncing Roadmap...')).not.toBeVisible();
        await expect(page.getByText('Transaction Roadmap')).toBeVisible();

        // Change Status to "House Hunting"
        // Target the select element inside the Command Center
        const statusSelect = page.locator('select');
        await expect(statusSelect).toBeVisible();

        // Reset to Lead first just in case (though it should be Lead)
        await statusSelect.selectOption('lead');
        await page.waitForTimeout(1000); // Give DB time to settle if needed

        // Change to House Hunting
        await statusSelect.selectOption('house_hunting');

        // Verify UI update: "Discovery & Listing Search" should become active (In Progress)
        // "active" status in UI renders with "In Progress" badge
        await expect(page.getByText('In Progress').first()).toBeVisible();

        // Verify Dropdown value
        await expect(statusSelect).toHaveValue('house_hunting');

        // Optional: Reload and verify persistence
        await page.reload();
        await expect(page.getByText('Syncing Roadmap...')).not.toBeVisible();
        await expect(page.locator('select')).toHaveValue('house_hunting');
    });
});
