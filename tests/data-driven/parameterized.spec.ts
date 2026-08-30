/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DATA-DRIVEN TESTS - Parameterized Testing
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Run same test with multiple data sets.
 * WHY: Maximize coverage with minimal code duplication.
 * IF NOT USED: Copy-paste tests for each data variation.
 * INTERVIEW TIP: "Data-driven tests separate test logic from test data"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages';
import { logTestStart, logTestEnd } from '../../src/helpers';

const validLoginData = [
    { username: 'Admin', password: 'admin123', description: 'admin user' },
];

const invalidLoginData = [
    { username: '', password: 'admin123', description: 'empty username' },
    { username: 'Admin', password: '', description: 'empty password' },
    { username: 'invalid', password: 'wrong', description: 'wrong credentials' },
];

const viewportData = [
    { width: 375, height: 667, device: 'iPhone SE' },
    { width: 768, height: 1024, device: 'iPad' },
    { width: 1280, height: 720, device: 'Desktop HD' },
];

test.describe('Data-Driven Tests @data-driven @regression', () => {

    test.describe('Parameterized Login Tests', () => {

        for (const data of validLoginData) {
            test('should login successfully with ' + data.description, async ({ page }) => {
                logTestStart('Login with ' + data.description);
                const loginPage = new LoginPage(page);
                await loginPage.navigate();
                await loginPage.login({ username: data.username, password: data.password });
                await expect(page).toHaveURL(/.*dashboard.*/);
                logTestEnd('Login with ' + data.description, 'passed');
            });
        }

        for (const data of invalidLoginData) {
            test('should show error for ' + data.description, async ({ page }) => {
                logTestStart('Error for ' + data.description);
                const loginPage = new LoginPage(page);
                await loginPage.navigate();
                await loginPage.login({ username: data.username, password: data.password });
                const currentUrl = page.url();
                expect(currentUrl).toContain('login');
                logTestEnd('Error for ' + data.description, 'passed');
            });
        }
    });

    test.describe('Responsive Design Tests', () => {

        for (const viewport of viewportData) {
            test('should render correctly on ' + viewport.device, async ({ page }) => {
                logTestStart('Responsive test - ' + viewport.device);
                await page.setViewportSize({ width: viewport.width, height: viewport.height });
                const loginPage = new LoginPage(page);
                await loginPage.navigate();
                const loginForm = page.locator('.orangehrm-login-form');
                await expect(loginForm).toBeVisible();
                logTestEnd('Responsive test - ' + viewport.device, 'passed');
            });
        }
    });
});
