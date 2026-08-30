/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ALLURE DEMO TESTS - Rich Reporting with Step Annotations
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Demonstrate Allure step annotations for rich test reports.
 * WHY: Allure creates beautiful, interactive reports with step hierarchy.
 * IF NOT USED: Flat reports without clear step breakdown or categorization.
 * INTERVIEW TIP: "Allure reports show test execution flow with attachments"
 *
 * RUN ALLURE REPORT:
 * npm run report:allure
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { test, expect } from '../../src/fixtures';
import {
    allure,
    precondition,
    action,
    verify,
    attachJSON,
    testCategory
} from '../../src/helpers';

test.describe('Allure Reporting Demo @allure @smoke', () => {

    test('should demonstrate step annotations in login flow', async ({ loginPage, page }) => {
        // Categorize test for filtering in Allure
        allure.feature('Authentication');
        allure.story('User Login');
        allure.severity('critical');
        allure.owner('qa-team');

        await precondition('Navigate to login page', async () => {
            await loginPage.navigate();
            await expect(page).toHaveURL(/login/);
        });

        await action('Enter valid credentials', async () => {
            await page.fill('input[name="username"]', 'Admin');
            await page.fill('input[name="password"]', 'admin123');
        });

        // Attach test data for debugging
        await attachJSON('Login Credentials', {
            username: 'Admin',
            role: 'Administrator',
            timestamp: new Date().toISOString()
        });

        await action('Click login button', async () => {
            await page.click('button[type="submit"]');
        });

        await verify('Dashboard is displayed', async () => {
            await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
        });

        await verify('Welcome message is visible', async () => {
            const header = page.locator('.oxd-topbar-header-breadcrumb');
            await expect(header).toContainText('Dashboard');
        });
    });

    test('should demonstrate test categorization', async ({ loginPage, page }) => {
        // Epic -> Feature -> Story hierarchy
        testCategory.epic('User Management');
        testCategory.feature('Authentication');
        testCategory.story('Login Validation');

        allure.severity('normal');

        await precondition('Open login page', async () => {
            await loginPage.navigate();
        });

        await action('Submit empty form', async () => {
            await page.click('button[type="submit"]');
        });

        await verify('Validation message appears', async () => {
            // OrangeHRM shows "Required" for empty fields
            const errorMessages = page.locator('.oxd-input-field-error-message');
            await expect(errorMessages.first()).toBeVisible();
        });
    });

    test('should demonstrate attachments for debugging', async ({ pimPage, page }) => {
        allure.feature('PIM');
        allure.story('Employee List');
        allure.severity('normal');

        await precondition('Navigate to PIM module', async () => {
            await pimPage.navigate();
        });

        // Capture page state for debugging
        const pageInfo = await page.evaluate(() => ({
            url: window.location.href,
            title: document.title,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            timestamp: new Date().toISOString()
        }));

        await attachJSON('Page State', pageInfo);

        await verify('Employee list is displayed', async () => {
            const table = page.locator('.oxd-table');
            await expect(table).toBeVisible({ timeout: 10000 });
        });

        // Attach any network requests for debugging API issues
        const cookies = await page.context().cookies();
        await attachJSON('Session Cookies', cookies.map(c => ({
            name: c.name,
            domain: c.domain,
            secure: c.secure
        })));
    });

    test('should demonstrate failure with clear steps', async ({ loginPage, page }) => {
        allure.feature('Authentication');
        allure.story('Invalid Login');
        allure.severity('minor');

        await precondition('Navigate to login page', async () => {
            await loginPage.navigate();
        });

        await action('Enter invalid credentials', async () => {
            await page.fill('input[name="username"]', 'InvalidUser');
            await page.fill('input[name="password"]', 'WrongPassword');
        });

        await attachJSON('Test Data', {
            username: 'InvalidUser',
            expectedResult: 'Error message displayed'
        });

        await action('Submit login form', async () => {
            await page.click('button[type="submit"]');
        });

        await verify('Error message is displayed', async () => {
            // Check for error alert
            const errorAlert = page.locator('.oxd-alert-content');
            await expect(errorAlert).toBeVisible({ timeout: 5000 });
            await expect(errorAlert).toContainText('Invalid credentials');
        });

        await verify('User remains on login page', async () => {
            await expect(page).toHaveURL(/login/);
        });
    });
});
