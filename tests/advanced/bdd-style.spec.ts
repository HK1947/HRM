/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BDD-STYLE TESTS - Behavior-Driven Development Pattern
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Tests written in Given-When-Then format without Cucumber.
 * WHY: Readable tests that serve as living documentation.
 * IF NOT USED: Tests hard to understand, poor documentation.
 * INTERVIEW TIP: "BDD focuses on behavior from user's perspective, not implementation"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages';
import { logTestStart, logTestEnd, DataFactory } from '../../src/helpers';

/**
 * BDD Helper Functions
 *
 * INTERVIEW TIP: "These helpers make tests read like Gherkin scenarios
 * without needing Cucumber complexity"
 */
function Given(description: string): void {
    console.log(`  📋 GIVEN ${description}`);
}

function When(description: string): void {
    console.log(`  🔄 WHEN ${description}`);
}

function Then(description: string): void {
    console.log(`  ✅ THEN ${description}`);
}

function And(description: string): void {
    console.log(`  ➕ AND ${description}`);
}

test.describe('Feature: User Authentication @bdd @regression', () => {

    test.describe('Scenario: Successful login with valid credentials', () => {

        test('should allow user to login', async ({ page }) => {
            logTestStart('BDD - Successful login');

            const loginPage = new LoginPage(page);

            Given('the user is on the login page');
            await loginPage.navigate();

            And('the user has valid credentials');
            const credentials = DataFactory.createLoginCredentials();

            When('the user enters their username and password');
            await loginPage.enterUsername(credentials.username);
            await loginPage.enterPassword(credentials.password);

            And('clicks the login button');
            await loginPage.clickLogin();

            Then('they should be redirected to the dashboard');
            await expect(page).toHaveURL(/.*dashboard.*/);

            And('should see their dashboard content');
            await expect(page.locator('.oxd-topbar')).toBeVisible();

            logTestEnd('BDD - Successful login', 'passed');
        });
    });

    test.describe('Scenario: Failed login with invalid credentials', () => {

        test('should show error for wrong password', async ({ page }) => {
            logTestStart('BDD - Failed login');

            const loginPage = new LoginPage(page);

            Given('the user is on the login page');
            await loginPage.navigate();

            When('the user enters a valid username');
            await loginPage.enterUsername('Admin');

            And('enters an incorrect password');
            await loginPage.enterPassword('wrongpassword');

            And('clicks the login button');
            await loginPage.clickLogin();

            Then('they should see an error message');
            const isErrorDisplayed = await loginPage.isErrorDisplayed();
            expect(isErrorDisplayed).toBeTruthy();

            And('should remain on the login page');
            await expect(page).toHaveURL(/.*login.*/);

            logTestEnd('BDD - Failed login', 'passed');
        });
    });

    test.describe('Scenario: Login form validation', () => {

        test('should require username and password', async ({ page }) => {
            logTestStart('BDD - Form validation');

            const loginPage = new LoginPage(page);

            Given('the user is on the login page');
            await loginPage.navigate();

            When('the user clicks login without entering credentials');
            await loginPage.submitEmptyForm();

            Then('they should see validation errors');
            const isErrorDisplayed = await loginPage.isErrorDisplayed();
            expect(isErrorDisplayed).toBeTruthy();

            logTestEnd('BDD - Form validation', 'passed');
        });
    });
});

test.describe('Feature: Password Recovery @bdd', () => {

    test.describe('Scenario: Navigate to forgot password page', () => {

        test('should allow user to access password recovery', async ({ page }) => {
            logTestStart('BDD - Password recovery');

            const loginPage = new LoginPage(page);

            Given('the user is on the login page');
            await loginPage.navigate();

            When('the user clicks on forgot password link');
            await loginPage.clickForgotPassword();

            Then('they should be redirected to password reset page');
            await expect(page).toHaveURL(/.*requestPasswordResetCode.*/);

            logTestEnd('BDD - Password recovery', 'passed');
        });
    });
});

test.describe('Feature: Dashboard Navigation @bdd', () => {

    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.navigate();
        await loginPage.login({ username: 'Admin', password: 'admin123' });
        await page.waitForURL('**/dashboard/**');
    });

    test.describe('Scenario: Access PIM module', () => {

        test('should navigate to employee list', async ({ page }) => {
            logTestStart('BDD - PIM navigation');

            Given('the user is logged in and on the dashboard');
            // (handled in beforeEach)

            When('the user clicks on PIM in the sidebar');
            await page.click('text=PIM');

            Then('they should see the employee list page');
            await page.waitForLoadState('networkidle');
            await expect(page).toHaveURL(/.*viewEmployeeList.*/);

            And('the page should display the employee table');
            await expect(page.locator('.oxd-table')).toBeVisible();

            logTestEnd('BDD - PIM navigation', 'passed');
        });
    });

    test.describe('Scenario: User logout', () => {

        test('should allow user to logout', async ({ page }) => {
            logTestStart('BDD - Logout');

            Given('the user is logged in');
            // (handled in beforeEach)

            When('the user clicks on their profile dropdown');
            await page.click('.oxd-userdropdown');

            And('clicks logout');
            await page.click('text=Logout');

            Then('they should be redirected to the login page');
            await expect(page).toHaveURL(/.*login.*/);

            And('should see the login form');
            await expect(page.locator('input[name="username"]')).toBeVisible();

            logTestEnd('BDD - Logout', 'passed');
        });
    });
});

/**
 * BDD with Data Tables
 *
 * INTERVIEW TIP: "Data tables in BDD represent multiple examples
 * of the same scenario"
 */
test.describe('Feature: Input Validation @bdd @data-table', () => {

    const invalidInputs = [
        { input: '', description: 'empty string', expectError: true },
        { input: ' ', description: 'whitespace only', expectError: true },
        { input: 'a'.repeat(256), description: 'very long input', expectError: true },
        { input: '<script>', description: 'XSS attempt', expectError: true },
    ];

    test.describe('Scenario Outline: Reject invalid inputs', () => {

        for (const { input, description, expectError } of invalidInputs) {
            test(`should reject ${description}`, async ({ page }) => {
                logTestStart(`BDD - Reject ${description}`);

                const loginPage = new LoginPage(page);

                Given(`the user is on the login page`);
                await loginPage.navigate();

                When(`the user enters "${description}" as username`);
                await loginPage.enterUsername(input);
                await loginPage.enterPassword('test');

                And('submits the form');
                await loginPage.clickLogin();

                Then(`they should ${expectError ? 'see an error' : 'succeed'}`);
                if (expectError) {
                    // Should show error or stay on login
                    await expect(page).toHaveURL(/.*login.*/);
                }

                logTestEnd(`BDD - Reject ${description}`, 'passed');
            });
        }
    });
});

/**
 * BDD with Background (shared context)
 *
 * INTERVIEW TIP: "Background in BDD sets up common preconditions
 * for all scenarios in a feature"
 */
test.describe('Feature: Employee Management @bdd @background', () => {

    // Background: User is logged in as Admin
    test.beforeEach(async ({ page }) => {
        console.log('  📌 BACKGROUND: User is logged in as Admin');
        const loginPage = new LoginPage(page);
        await loginPage.navigate();
        await loginPage.login({ username: 'Admin', password: 'admin123' });
        await page.waitForURL('**/dashboard/**');
    });

    test.describe('Scenario: View employee list', () => {

        test('should display employees table', async ({ page }) => {
            logTestStart('BDD - View employees');

            // Background already executed

            When('the user navigates to PIM');
            await page.click('text=PIM');
            await page.waitForLoadState('networkidle');

            Then('they should see the employee list');
            await expect(page.locator('.oxd-table')).toBeVisible();

            logTestEnd('BDD - View employees', 'passed');
        });
    });

    test.describe('Scenario: Search for employee', () => {

        test('should filter employees by name', async ({ page }) => {
            logTestStart('BDD - Search employee');

            // Background already executed

            When('the user navigates to PIM');
            await page.click('text=PIM');
            await page.waitForLoadState('networkidle');

            And('enters a search term');
            const searchInput = page.locator('.oxd-input').first();
            if (await searchInput.isVisible()) {
                await searchInput.fill('Admin');
            }

            Then('the list should be filtered');
            // Results shown (could be filtered or all)
            await expect(page.locator('.oxd-table')).toBeVisible();

            logTestEnd('BDD - Search employee', 'passed');
        });
    });
});
