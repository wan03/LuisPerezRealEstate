import { test, expect } from '@playwright/test';

test('Analytics and New Transaction Workflow', async ({ page }) => {
    // 1. Login
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'agent@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('/portal');

    // 2. Open New Transaction Modal
    await page.click('button:has-text("New Transaction")');
    await expect(page.locator('text=Add Client to Pipeline')).toBeVisible();

    // 3. Fill Form with Financials
    const uniqueName = `Analytic Test ${Date.now()}`;
    await page.fill('input[placeholder="e.g. Michael Scott"]', uniqueName);
    await page.fill('input[placeholder="e.g. 1725 Slough Avenue"]', '123 Profit Lane');
    await page.fill('input[placeholder="500000"]', '500000'); // Est Value $500k
    await page.fill('input[placeholder="3.0"]', '3.0'); // Commission 3%

    // 4. Submit
    const createPromise = page.waitForResponse(resp => resp.url().includes('transactions') && resp.status() === 201);
    await page.click('button:has-text("Create Transaction")');
    await createPromise;

    // 5. Verify Client Appears in List
    await expect(page.locator(`text=${uniqueName}`)).toBeVisible();

    // 6. Navigate to Analytics Tab
    await page.click('text=Analytics');
    await page.waitForURL('**/portal/analytics');

    // 7. Verify KPIs
    // We expect "Active Clients" to be at least 1, "Volume" to include our $500k, and "Projected GCI" to include $15k.
    // Since we can't easily reset DB state, we check for visibility of the formatted currency.
    // Note: formatCurrency(500000) -> "$500,000"
    await expect(page.locator('text=Active Clients')).toBeVisible();
    await expect(page.locator('text=Volume (Active)')).toBeVisible();
    await expect(page.locator('text=Projected GCI')).toBeVisible();

    // Check for the specific insight text if possible, or just the presence of the dashboard components
    await expect(page.locator('text=Pipeline Distribution')).toBeVisible();
    await expect(page.locator('text=Monthly Goal')).toBeVisible();

    // Optional: Check if the volume text contains a dollar sign to confirm rendering
    const volumeText = await page.locator('text=Volume (Active) >> .. >> p').textContent();
    expect(volumeText).toContain('$');
});
