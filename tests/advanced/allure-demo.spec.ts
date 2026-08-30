/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ALLURE DEMO TESTS - Rich Reporting with Step Annotations
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Demonstrate Allure step annotations for rich test reports.
 * WHY: Allure creates beautiful, interactive reports with step hierarchy.
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

test.describe('Allure Reporting Demo @allure', () => {

    test('should demonstrate step annotations in login flow @smoke', async ({ loginPage, page }) => {
        allure.feature('Authentication');
        allure.story('User Login');
        allure.severity('critical');

        await precondition('Navigate to login page', async () => {
            await loginPage.navigate();
        });

        await action('Enter valid credentials', async () => {
            await page.fill('input[name="username"]', 'Admin');
            await page.fill('input[name="password"]', 'admin123');
        });

        await attachJSON('Login Credentials', {
            username: 'Admin',
            role: 'Administrator',
            timestamp: new Date().toISOString()
        });

        await action('Click login button', async () => {
            await page.click('button[type="submit"]');
        });

        await verify('Dashboard is displayed', async () => {
            await expect(page).toHaveURL(/dashboard/, { timeout: 30000 });
        });
    });

    test('should demonstrate test categorization', async ({ loginPage, page }) => {
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
            await page.waitForTimeout(1000);
            const errorMessages = page.locator('.oxd-input-field-error-message');
            const hasError = await errorMessages.first().isVisible();
            expect(hasError).toBeTruthy();
        });
    });

    test('should demonstrate attachments for debugging', async ({ pimPage, page }) => {
        allure.feature('PIM');
        allure.story('Employee List');
        allure.severity('normal');

        await precondition('Navigate to PIM module', async () => {
            await pimPage.navigate();
        });

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

        await verify('Employee table is present', async () => {
            const table = page.locator('.oxd-table');
            await expect(table).toBeVisible({ timeout: 15000 });
        });
    });

    test('should demonstrate error handling flow', async ({ loginPage, page }) => {
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

        await verify('User remains on login page', async () => {
            await page.waitForTimeout(2000);
            await expect(page).toHaveURL(/login/);
        });
    });
});
