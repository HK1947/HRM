/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SOFT ASSERTIONS TESTS - Collect All Failures
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Demonstrates soft assertions pattern.
 * WHY: Sometimes you want to collect ALL failures, not fail on first.
 * INTERVIEW TIP: "Soft assertions let you see all failures at once"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages';
import { logTestStart, logTestEnd } from '../../src/helpers';

test.describe('Soft Assertions @soft-assertions', () => {
    test('should collect multiple assertions @smoke', async ({ page }) => {
        logTestStart('Soft assertions - demo');
        const loginPage = new LoginPage(page);
        await loginPage.navigate();

        // Use native Playwright soft assertions
        await expect.soft(page).toHaveTitle(/OrangeHRM/);
        await expect.soft(page).toHaveURL(/.*login.*/);
        await expect.soft(page.locator('input[name="username"]')).toBeVisible();
        await expect.soft(page.locator('input[name="password"]')).toBeVisible();

        logTestEnd('Soft assertions - demo', 'passed');
    });

    test('should use expect.soft() for native soft assertions', async ({ page }) => {
        logTestStart('Native soft assertions');
        const loginPage = new LoginPage(page);
        await loginPage.navigate();

        await expect.soft(page).toHaveTitle(/OrangeHRM/);
        await expect.soft(page.locator('input[name="username"]')).toBeVisible();
        await expect.soft(page.locator('button[type="submit"]')).toBeEnabled();

        logTestEnd('Native soft assertions', 'passed');
    });

    test('should mix soft and hard assertions', async ({ page }) => {
        logTestStart('Mixed assertions');
        const loginPage = new LoginPage(page);
        await loginPage.navigate();

        // Hard assertion - will fail immediately if wrong
        await expect(page).toHaveURL(/.*login.*/);

        // Soft assertions - will continue even if they fail
        await expect.soft(page.locator('.orangehrm-login-branding')).toBeVisible();
        await expect.soft(page.locator('button[type="submit"]')).toBeVisible();

        logTestEnd('Mixed assertions', 'passed');
    });
});
