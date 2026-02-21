import { test, expect } from '@playwright/test';
import testData from '../test-credentials.json';

test.describe('Email Templates Admin UI', () => {
    const agent = testData.users.find(u => u.role === 'agent')!;

    test.beforeEach(async ({ page }) => {
        // Log in as agent
        await page.goto('/login');
        await page.fill('input[type="email"]', agent.email);
        await page.fill('input[type="password"]', testData.password);
        await page.click('button[type="submit"]', { force: true });
        await page.waitForURL('/portal*', { timeout: 30000 });

        // Navigate to Email Templates
        await page.click('text=Email Templates');
        await expect(page.locator('text=Email Templates').first()).toBeVisible({ timeout: 15000 });
    });

    test('Agent can view, edit, and toggle email templates', async ({ page }) => {
        // 1. View Templates
        await expect(page.locator('text=Available Variables')).toBeVisible();

        // Wait for templates to load
        await expect(page.locator('text=Offer Accepted')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=subject')).first().toBeVisible();

        // 2. Edit a Template
        // Find the 'Edit' button for the first template
        const editButtons = page.locator('button:has-text("Edit")');
        await expect(editButtons.first()).toBeVisible();
        await editButtons.first().click();

        // Change Subject
        const subjectInput = page.locator('input[type="text"]').first();
        const originalSubject = await subjectInput.inputValue();
        const newSubject = originalSubject + ' - Updated';
        await subjectInput.fill(newSubject);

        // Save
        const saveButton = page.locator('button:has-text("Save")');
        await saveButton.click();

        // Verify Save (The subject string should now be visible in read-only mode)
        await expect(page.locator(`text=${newSubject}`)).toBeVisible();

        // Clean up: Revert the change
        await editButtons.first().click();
        await subjectInput.fill(originalSubject);
        await saveButton.click();
        await expect(page.locator(`text=${originalSubject}`)).toBeVisible();

        // 3. Toggle Active Status
        const disableButton = page.locator('button:has-text("Disable")').first();
        if (await disableButton.isVisible()) {
            await disableButton.click();
            await expect(page.locator('button:has-text("Enable")').first()).toBeVisible();

            // Re-enable
            await page.locator('button:has-text("Enable")').first().click();
            await expect(page.locator('button:has-text("Disable")').first()).toBeVisible();
        }
    });
});
