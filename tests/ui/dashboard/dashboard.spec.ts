/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DASHBOARD TESTS - Main Dashboard Scenarios
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Test suite for dashboard functionality and navigation.
 * WHY: Dashboard is the main hub - all navigation starts here.
 * INTERVIEW TIP: "Dashboard tests verify the app's main entry point works"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { test, expect } from '../../../src/fixtures';
import { logTestStart, logTestEnd } from '../../../src/helpers';

test.describe('Dashboard Functionality @regression', () => {

    test.beforeEach(async ({ dashboardPage }) => {
        await dashboardPage.navigate();
    });

    test.describe('Positive Scenarios', () => {

        test('should display dashboard after login @smoke', async ({ page }) => {
            logTestStart('Display dashboard after login');

            // Simple check - we're on the dashboard URL
            await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 30000 });

            logTestEnd('Display dashboard after login', 'passed');
        });

        test('should display quick launch widgets @smoke', async ({ page }) => {
            logTestStart('Display quick launch widgets');

            const widgets = page.locator('.orangehrm-dashboard-widget');
            await expect(widgets.first()).toBeVisible({ timeout: 15000 });

            logTestEnd('Display quick launch widgets', 'passed');
        });

        test('should display sidebar menu', async ({ page }) => {
            logTestStart('Display sidebar menu');

            const sidebar = page.locator('.oxd-sidepanel');
            await expect(sidebar).toBeVisible();

            logTestEnd('Display sidebar menu', 'passed');
        });

        test('should display header', async ({ page }) => {
            logTestStart('Display header');

            const header = page.locator('.oxd-topbar');
            await expect(header).toBeVisible();

            logTestEnd('Display header', 'passed');
        });

        test('should display user dropdown', async ({ page }) => {
            logTestStart('Display user dropdown');

            const userDropdown = page.locator('.oxd-userdropdown');
            await expect(userDropdown).toBeVisible();

            logTestEnd('Display user dropdown', 'passed');
        });

        test('should navigate to PIM module @smoke', async ({ page }) => {
            logTestStart('Navigate to PIM module');

            await page.locator('.oxd-sidepanel a[href*="pim"]').first().click();
            await expect(page).toHaveURL(/.*pim.*/, { timeout: 15000 });

            logTestEnd('Navigate to PIM module', 'passed');
        });

        test('should navigate to Leave module', async ({ page }) => {
            logTestStart('Navigate to Leave module');

            await page.locator('.oxd-sidepanel a[href*="leave"]').first().click();
            await expect(page).toHaveURL(/.*leave.*/, { timeout: 15000 });

            logTestEnd('Navigate to Leave module', 'passed');
        });

        test('should navigate to Admin module', async ({ page }) => {
            logTestStart('Navigate to Admin module');

            await page.locator('.oxd-sidepanel a[href*="admin"]').first().click();
            await expect(page).toHaveURL(/.*admin.*/, { timeout: 15000 });

            logTestEnd('Navigate to Admin module', 'passed');
        });
    });

    test.describe('Logout Scenarios', () => {

        test('should logout successfully @smoke', async ({ page }) => {
            logTestStart('Logout successfully');

            // Click user dropdown
            await page.locator('.oxd-userdropdown').click();
            // Click logout
            await page.locator('a[href*="logout"]').click();
            // Verify redirected to login
            await expect(page).toHaveURL(/.*login.*/, { timeout: 15000 });

            logTestEnd('Logout successfully', 'passed');
        });

        test('should redirect to login after logout', async ({ page }) => {
            logTestStart('Redirect to login after logout');

            await page.locator('.oxd-userdropdown').click();
            await page.locator('a[href*="logout"]').click();
            await expect(page).toHaveURL(/.*login.*/);

            // Verify login form is visible
            const loginButton = page.locator('button[type="submit"]');
            await expect(loginButton).toBeVisible();

            logTestEnd('Redirect to login after logout', 'passed');
        });
    });

    test.describe('Sidebar Navigation', () => {

        test('should display menu items in sidebar', async ({ page }) => {
            logTestStart('Display menu items in sidebar');

            const menuItems = page.locator('.oxd-sidepanel-body li');
            const count = await menuItems.count();
            expect(count).toBeGreaterThan(5);

            logTestEnd('Display menu items in sidebar', 'passed');
        });

        test('should have search box in sidebar', async ({ page }) => {
            logTestStart('Search box in sidebar');

            const searchBox = page.locator('.oxd-sidepanel input[type="text"]');
            await expect(searchBox).toBeVisible();

            logTestEnd('Search box in sidebar', 'passed');
        });
    });
});
