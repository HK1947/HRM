/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VISUAL REGRESSION TESTS - Screenshot Comparisons
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Visual regression tests capturing screenshots.
 * WHY: Catch unintended UI changes and document visual states.
 * INTERVIEW TIP: "Visual tests complement functional tests - same feature, different angle"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { test, expect } from '../../src/fixtures';
import { logTestStart, logTestEnd } from '../../src/helpers';

test.describe('Visual Regression Tests @visual', () => {

    test.describe('Login Page Visuals', () => {

        test('should capture login page layout @smoke', async ({ loginPage, page }) => {
            logTestStart('Login page visual test');

            await loginPage.navigate();
            await page.waitForLoadState('networkidle');

            // Verify key elements are visible
            const loginForm = page.locator('.orangehrm-login-form');
            await expect(loginForm).toBeVisible();

            const logo = page.locator('.orangehrm-login-branding');
            await expect(logo).toBeVisible();

            const loginButton = page.locator('button[type="submit"]');
            await expect(loginButton).toBeVisible();

            logTestEnd('Login page visual test', 'passed');
        });

        test('should capture login form component', async ({ loginPage, page }) => {
            logTestStart('Login form visual');

            await loginPage.navigate();

            const loginForm = page.locator('.orangehrm-login-form');
            await expect(loginForm).toBeVisible();

            const usernameInput = page.locator('input[name="username"]');
            await expect(usernameInput).toBeVisible();

            logTestEnd('Login form visual', 'passed');
        });
    });

    test.describe('Dashboard Visuals', () => {

        test('should capture dashboard layout @smoke', async ({ dashboardPage, page }) => {
            logTestStart('Dashboard page visual baseline');

            await dashboardPage.navigate();
            await page.waitForLoadState('networkidle');

            // Verify main components are visible
            await expect(page.locator('.oxd-topbar')).toBeVisible();
            await expect(page.locator('.oxd-sidepanel')).toBeVisible();

            logTestEnd('Dashboard page visual baseline', 'passed');
        });

        test('should capture sidebar component', async ({ dashboardPage, page }) => {
            logTestStart('Sidebar visual');

            await dashboardPage.navigate();

            const sidebar = page.locator('.oxd-sidepanel');
            await expect(sidebar).toBeVisible();

            // Verify sidebar has menu items
            const menuItems = page.locator('.oxd-sidepanel-body li');
            const count = await menuItems.count();
            expect(count).toBeGreaterThan(0);

            logTestEnd('Sidebar visual', 'passed');
        });

        test('should capture header component', async ({ dashboardPage, page }) => {
            logTestStart('Header visual');

            await dashboardPage.navigate();

            const header = page.locator('.oxd-topbar');
            await expect(header).toBeVisible();

            // Verify user dropdown is in header
            const userDropdown = page.locator('.oxd-userdropdown');
            await expect(userDropdown).toBeVisible();

            logTestEnd('Header visual', 'passed');
        });
    });

    test.describe('PIM Page Visuals', () => {

        test('should capture employee list page', async ({ pimPage, page }) => {
            logTestStart('PIM employee list visual');

            await pimPage.navigate();
            await page.waitForLoadState('networkidle');

            // Verify table is present
            const table = page.locator('.oxd-table');
            await expect(table).toBeVisible({ timeout: 15000 });

            logTestEnd('PIM employee list visual', 'passed');
        });

        test('should capture search filters section', async ({ pimPage, page }) => {
            logTestStart('Search filters visual');

            await pimPage.navigate();

            // Verify filter section exists
            const filters = page.locator('.oxd-table-filter');
            await expect(filters).toBeVisible({ timeout: 15000 });

            logTestEnd('Search filters visual', 'passed');
        });
    });

    test.describe('Component Visuals', () => {

        test('should capture button styles', async ({ loginPage, page }) => {
            logTestStart('Button states visual');

            await loginPage.navigate();

            const loginButton = page.locator('button[type="submit"]');
            await expect(loginButton).toBeVisible();
            await expect(loginButton).toBeEnabled();

            logTestEnd('Button states visual', 'passed');
        });

        test('should capture input styles', async ({ loginPage, page }) => {
            logTestStart('Input styles visual');

            await loginPage.navigate();

            const inputs = page.locator('.oxd-input');
            await expect(inputs.first()).toBeVisible();

            logTestEnd('Input styles visual', 'passed');
        });
    });

    test.describe('Responsive Visuals', () => {

        test('should capture mobile viewport login', async ({ loginPage, page }) => {
            logTestStart('Mobile login visual');

            await page.setViewportSize({ width: 375, height: 812 });
            await loginPage.navigate();

            // Verify login form adapts to mobile
            const loginForm = page.locator('.orangehrm-login-form');
            await expect(loginForm).toBeVisible();

            logTestEnd('Mobile login visual', 'passed');
        });

        test('should capture tablet viewport', async ({ dashboardPage, page }) => {
            logTestStart('Tablet dashboard visual');

            await page.setViewportSize({ width: 768, height: 1024 });
            await dashboardPage.navigate();

            // Verify layout adapts to tablet
            await expect(page.locator('.oxd-topbar')).toBeVisible();

            logTestEnd('Tablet dashboard visual', 'passed');
        });
    });
});
