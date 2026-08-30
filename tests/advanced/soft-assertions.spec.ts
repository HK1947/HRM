/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SOFT ASSERTIONS TESTS - Collect All Failures
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { test, expect } from '@playwright/test';
import { createSoftAssert } from '../../src/helpers/custom-matchers';
import { LoginPage } from '../../src/pages';
import { logTestStart, logTestEnd } from '../../src/helpers';

test.describe('Soft Assertions @soft-assertions @regression', () => {
    test('should collect multiple failures @smoke', async ({ page }) => {
        logTestStart('Soft assertions - multiple failures');
        const loginPage = new LoginPage(page);
        await loginPage.navigate();
        const soft = createSoftAssert();
        soft.expect(await page.title()).toBe('OrangeHRM');
        soft.expect(await page.url()).toContain('login');
        soft.assertAll();
        logTestEnd('Soft assertions - multiple failures', 'passed');
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
        await expect(page).toHaveURL(/.*login.*/);
        await expect.soft(page.locator('.orangehrm-login-branding')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
        logTestEnd('Mixed assertions', 'passed');
    });
});
