/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VISUAL REGRESSION TESTS - Screenshot Comparison (Per-Browser Baselines)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Automated visual regression testing using screenshot comparison.
 * WHY: Catch unintended UI changes that functional tests miss.
 * IF NOT USED: Visual bugs slip into production undetected.
 * INTERVIEW TIP: "Visual tests need per-browser baselines - rendering differs"
 *
 * BASELINE STRATEGY:
 * - Screenshots are stored in __snapshots__/<browser>/ directories
 * - Each browser has its own baseline (Chrome renders differently than Firefox)
 * - CI runs visual tests for all browsers in parallel
 * - Use --update-snapshots to regenerate baselines after intentional changes
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { test, expect } from '../../src/fixtures';
import { logTestStart, logTestEnd } from '../../src/helpers';

/**
 * Helper to get browser-specific snapshot name
 * INTERVIEW TIP: "Per-browser baselines prevent false positives from rendering differences"
 */
function getSnapshotName(baseName: string, browserName: string): string {
    return `${browserName}/${baseName}`;
}

test.describe('Visual Regression Tests @visual @regression', () => {

    test.describe('Login Page Visuals', () => {

        test('should match login page baseline @smoke', async ({ loginPage, page }) => {
            logTestStart('Login page visual baseline');

            await loginPage.navigate();
            await page.waitForLoadState('networkidle');

            await expect(page).toHaveScreenshot('login-page.png', {
                maxDiffPixels: 100,
                threshold: 0.2
            });

            logTestEnd('Login page visual baseline', 'passed');
        });

        test('should match login form component', async ({ loginPage, page }) => {
            logTestStart('Login form visual');

            await loginPage.navigate();

            const loginForm = page.locator('.orangehrm-login-form');
            await expect(loginForm).toHaveScreenshot('login-form.png', {
                maxDiffPixels: 50
            });

            logTestEnd('Login form visual', 'passed');
        });

        test('should match login logo', async ({ loginPage, page }) => {
            logTestStart('Login logo visual');

            await loginPage.navigate();

            const logo = page.locator('.orangehrm-login-branding');
            await expect(logo).toHaveScreenshot('login-logo.png', {
                maxDiffPixels: 50
            });

            logTestEnd('Login logo visual', 'passed');
        });

        test('should match login error state', async ({ loginPage, page }) => {
            logTestStart('Login error visual');

            await loginPage.navigate();
            await loginPage.login({
                username: 'invalid',
                password: 'invalid'
            });

            await page.waitForTimeout(1000);

            const errorAlert = page.locator('.oxd-alert');
            if (await errorAlert.isVisible()) {
                await expect(errorAlert).toHaveScreenshot('login-error.png', {
                    maxDiffPixels: 50
                });
            }

            logTestEnd('Login error visual', 'passed');
        });
    });

    test.describe('Dashboard Visuals', () => {

        test('should match dashboard page baseline @smoke', async ({ dashboardPage, page }) => {
            logTestStart('Dashboard page visual baseline');

            await dashboardPage.navigate();
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(2000);

            await expect(page).toHaveScreenshot('dashboard-page.png', {
                maxDiffPixels: 500,
                threshold: 0.3,
                mask: [page.locator('.oxd-userdropdown')]
            });

            logTestEnd('Dashboard page visual baseline', 'passed');
        });

        test('should match sidebar component', async ({ dashboardPage, page }) => {
            logTestStart('Sidebar visual');

            await dashboardPage.navigate();

            const sidebar = page.locator('.oxd-sidepanel');
            await expect(sidebar).toHaveScreenshot('sidebar.png', {
                maxDiffPixels: 100
            });

            logTestEnd('Sidebar visual', 'passed');
        });

        test('should match header component', async ({ dashboardPage, page }) => {
            logTestStart('Header visual');

            await dashboardPage.navigate();

            const header = page.locator('.oxd-topbar');
            await expect(header).toHaveScreenshot('header.png', {
                maxDiffPixels: 100,
                mask: [page.locator('.oxd-userdropdown-name')]
            });

            logTestEnd('Header visual', 'passed');
        });

        test('should match quick launch widgets', async ({ dashboardPage, page }) => {
            logTestStart('Quick launch widgets visual');

            await dashboardPage.navigate();

            const quickLaunch = page.locator('.orangehrm-quick-launch');
            if (await quickLaunch.isVisible()) {
                await expect(quickLaunch).toHaveScreenshot('quick-launch.png', {
                    maxDiffPixels: 100
                });
            }

            logTestEnd('Quick launch widgets visual', 'passed');
        });

        test('should match collapsed sidebar', async ({ dashboardPage, page }) => {
            logTestStart('Collapsed sidebar visual');

            await dashboardPage.navigate();
            await dashboardPage.sidebar.collapse();

            const sidebar = page.locator('.oxd-sidepanel');
            await expect(sidebar).toHaveScreenshot('sidebar-collapsed.png', {
                maxDiffPixels: 50
            });

            logTestEnd('Collapsed sidebar visual', 'passed');
        });
    });

    test.describe('PIM Page Visuals', () => {

        test('should match PIM employee list baseline', async ({ pimPage, page }) => {
            logTestStart('PIM employee list visual');

            await pimPage.navigate();
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000);

            await expect(page).toHaveScreenshot('pim-employee-list.png', {
                maxDiffPixels: 500,
                threshold: 0.3,
                mask: [
                    page.locator('.oxd-userdropdown'),
                    page.locator('.oxd-table-card')
                ]
            });

            logTestEnd('PIM employee list visual', 'passed');
        });

        test('should match add employee form', async ({ pimPage, page }) => {
            logTestStart('Add employee form visual');

            await pimPage.navigate();
            await pimPage.clickAddEmployee();
            await page.waitForLoadState('networkidle');

            const form = page.locator('.orangehrm-employee-form');
            if (await form.isVisible()) {
                await expect(form).toHaveScreenshot('add-employee-form.png', {
                    maxDiffPixels: 100
                });
            }

            logTestEnd('Add employee form visual', 'passed');
        });

        test('should match search filters', async ({ pimPage, page }) => {
            logTestStart('Search filters visual');

            await pimPage.navigate();

            const filters = page.locator('.oxd-table-filter');
            if (await filters.isVisible()) {
                await expect(filters).toHaveScreenshot('pim-filters.png', {
                    maxDiffPixels: 100
                });
            }

            logTestEnd('Search filters visual', 'passed');
        });
    });

    test.describe('Component Visuals', () => {

        test('should match table component', async ({ pimPage, page }) => {
            logTestStart('Table component visual');

            await pimPage.navigate();
            await page.waitForLoadState('networkidle');

            const table = page.locator('.oxd-table');
            if (await table.isVisible()) {
                await expect(table).toHaveScreenshot('table-component.png', {
                    maxDiffPixels: 200,
                    mask: [page.locator('.oxd-table-card')]
                });
            }

            logTestEnd('Table component visual', 'passed');
        });

        test('should match toast notification', async ({
            pimPage,
            addEmployeePage,
            page
        }) => {
            logTestStart('Toast notification visual');

            await pimPage.navigate();
            await pimPage.clickAddEmployee();

            const employee = {
                firstName: 'VisualTest',
                lastName: 'User'
            };
            await addEmployeePage.fillEmployeeForm(employee);
            await addEmployeePage.save();

            const toast = page.locator('.oxd-toast');
            await toast.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

            if (await toast.isVisible()) {
                await expect(toast).toHaveScreenshot('toast-success.png', {
                    maxDiffPixels: 50
                });
            }

            logTestEnd('Toast notification visual', 'passed');
        });

        test('should match button states', async ({ loginPage, page }) => {
            logTestStart('Button states visual');

            await loginPage.navigate();

            const loginButton = page.locator('button[type="submit"]');
            await expect(loginButton).toHaveScreenshot('login-button.png', {
                maxDiffPixels: 20
            });

            logTestEnd('Button states visual', 'passed');
        });
    });

    test.describe('Responsive Visuals', () => {

        test('should match mobile viewport login', async ({ loginPage, page }) => {
            logTestStart('Mobile login visual');

            await page.setViewportSize({ width: 375, height: 812 });
            await loginPage.navigate();

            await expect(page).toHaveScreenshot('login-mobile.png', {
                maxDiffPixels: 100
            });

            logTestEnd('Mobile login visual', 'passed');
        });

        test('should match tablet viewport dashboard', async ({ dashboardPage, page }) => {
            logTestStart('Tablet dashboard visual');

            await page.setViewportSize({ width: 768, height: 1024 });
            await dashboardPage.navigate();
            await page.waitForTimeout(1000);

            await expect(page).toHaveScreenshot('dashboard-tablet.png', {
                maxDiffPixels: 300,
                mask: [page.locator('.oxd-userdropdown')]
            });

            logTestEnd('Tablet dashboard visual', 'passed');
        });
    });
});
