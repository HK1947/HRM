/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DASHBOARD TESTS - Main Dashboard Scenarios
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Test suite for dashboard functionality and navigation.
 * WHY: Dashboard is the main hub - all navigation starts here.
 * IF NOT USED: No verification of post-login experience.
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

        test('should display dashboard after login @smoke', async ({ dashboardPage }) => {
            logTestStart('Display dashboard after login');

            await dashboardPage.verifyDashboardLoaded();

            logTestEnd('Display dashboard after login', 'passed');
        });

        test('should display quick launch widgets @smoke', async ({ dashboardPage }) => {
            logTestStart('Display quick launch widgets');

            const widgetCount = await dashboardPage.getQuickLaunchCount();
            expect(widgetCount).toBeGreaterThan(0);

            logTestEnd('Display quick launch widgets', 'passed');
        });

        test('should display time at work widget', async ({ dashboardPage }) => {
            logTestStart('Display time at work widget');

            const isVisible = await dashboardPage.isTimeWidgetVisible();
            expect(isVisible).toBeTruthy();

            logTestEnd('Display time at work widget', 'passed');
        });

        test('should display employee distribution chart', async ({ dashboardPage }) => {
            logTestStart('Display employee distribution chart');

            const isVisible = await dashboardPage.isChartVisible();
            expect(isVisible).toBeTruthy();

            logTestEnd('Display employee distribution chart', 'passed');
        });

        test('should display user name in header', async ({ dashboardPage }) => {
            logTestStart('Display user name in header');

            const userName = await dashboardPage.getUserName();
            expect(userName).toBeTruthy();
            expect(userName.length).toBeGreaterThan(0);

            logTestEnd('Display user name in header', 'passed');
        });

        test('should navigate to PIM module @smoke', async ({ dashboardPage, page }) => {
            logTestStart('Navigate to PIM module');

            await dashboardPage.navigateToPIM();
            await expect(page).toHaveURL(/.*pim.*/);

            logTestEnd('Navigate to PIM module', 'passed');
        });

        test('should navigate to Leave module', async ({ dashboardPage, page }) => {
            logTestStart('Navigate to Leave module');

            await dashboardPage.navigateToLeave();
            await expect(page).toHaveURL(/.*leave.*/);

            logTestEnd('Navigate to Leave module', 'passed');
        });

        test('should navigate to Admin module', async ({ dashboardPage, page }) => {
            logTestStart('Navigate to Admin module');

            await dashboardPage.navigateToAdmin();
            await expect(page).toHaveURL(/.*admin.*/);

            logTestEnd('Navigate to Admin module', 'passed');
        });

        test('should navigate to Time module', async ({ dashboardPage, page }) => {
            logTestStart('Navigate to Time module');

            await dashboardPage.navigateToTime();
            await expect(page).toHaveURL(/.*time.*/);

            logTestEnd('Navigate to Time module', 'passed');
        });

        test('should navigate to Recruitment module', async ({ dashboardPage, page }) => {
            logTestStart('Navigate to Recruitment module');

            await dashboardPage.navigateToRecruitment();
            await expect(page).toHaveURL(/.*recruitment.*/);

            logTestEnd('Navigate to Recruitment module', 'passed');
        });

        test('should navigate to My Info', async ({ dashboardPage, page }) => {
            logTestStart('Navigate to My Info');

            await dashboardPage.navigateToMyInfo();
            await expect(page).toHaveURL(/.*pim\/viewPersonalDetails.*/);

            logTestEnd('Navigate to My Info', 'passed');
        });

        test('should open user dropdown menu', async ({ dashboardPage }) => {
            logTestStart('Open user dropdown menu');

            await dashboardPage.openUserMenu();

            logTestEnd('Open user dropdown menu', 'passed');
        });
    });

    test.describe('Logout Scenarios', () => {

        test('should logout successfully @smoke', async ({ dashboardPage, page }) => {
            logTestStart('Logout successfully');

            await dashboardPage.logout();
            await expect(page).toHaveURL(/.*login.*/);

            logTestEnd('Logout successfully', 'passed');
        });

        test('should redirect to login after logout', async ({ dashboardPage, page }) => {
            logTestStart('Redirect to login after logout');

            await dashboardPage.logout();
            await expect(page).toHaveURL(/.*login.*/);

            const loginForm = page.locator('form.oxd-form');
            await expect(loginForm).toBeVisible();

            logTestEnd('Redirect to login after logout', 'passed');
        });
    });

    test.describe('Sidebar Navigation', () => {

        test('should display all menu items in sidebar', async ({ dashboardPage }) => {
            logTestStart('Display all menu items in sidebar');

            const menuItems = await dashboardPage.sidebar.getMenuItems();
            expect(menuItems.length).toBeGreaterThan(5);

            logTestEnd('Display all menu items in sidebar', 'passed');
        });

        test('should collapse sidebar', async ({ dashboardPage }) => {
            logTestStart('Collapse sidebar');

            await dashboardPage.sidebar.collapse();

            logTestEnd('Collapse sidebar', 'passed');
        });

        test('should expand sidebar', async ({ dashboardPage }) => {
            logTestStart('Expand sidebar');

            await dashboardPage.sidebar.collapse();
            await dashboardPage.sidebar.expand();

            logTestEnd('Expand sidebar', 'passed');
        });

        test('should search menu items', async ({ dashboardPage }) => {
            logTestStart('Search menu items');

            await dashboardPage.sidebar.searchMenu('PIM');
            const isPIMVisible = await dashboardPage.sidebar.isMenuVisible('PIM');
            expect(isPIMVisible).toBeTruthy();

            logTestEnd('Search menu items', 'passed');
        });
    });

    test.describe('Quick Launch Actions', () => {

        test('should click quick launch widget', async ({ dashboardPage, page }) => {
            logTestStart('Click quick launch widget');

            const initialUrl = page.url();
            await dashboardPage.clickQuickLaunch(0);

            await page.waitForLoadState('networkidle');
            const newUrl = page.url();
            expect(newUrl).not.toBe(initialUrl);

            logTestEnd('Click quick launch widget', 'passed');
        });
    });
});
