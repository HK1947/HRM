/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LOGIN TESTS - Authentication Scenarios
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Login test suite for OrangeHRM demo site.
 * WHY: Authentication is critical - must work perfectly.
 * INTERVIEW TIP: "Always test both happy path AND error scenarios"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { test, expect } from '../../../src/fixtures';
import { logTestStart, logTestEnd } from '../../../src/helpers';

test.describe('Login Functionality @regression', () => {

    test.beforeEach(async ({ loginPage }) => {
        await loginPage.navigate();
    });

    test.describe('Positive Scenarios', () => {

        test('should login with valid credentials @smoke', async ({ loginPage, page }) => {
            logTestStart('Login with valid credentials');

            await loginPage.login({ username: 'Admin', password: 'admin123' });
            await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 30000 });

            logTestEnd('Login with valid credentials', 'passed');
        });

        test('should display logo on login page', async ({ page }) => {
            logTestStart('Display logo on login page');

            const logo = page.locator('.orangehrm-login-branding img');
            await expect(logo).toBeVisible({ timeout: 10000 });

            logTestEnd('Display logo on login page', 'passed');
        });

        test('should have login button visible', async ({ page }) => {
            logTestStart('Login button visible');

            const loginButton = page.locator('button[type="submit"]');
            await expect(loginButton).toBeVisible();

            logTestEnd('Login button visible', 'passed');
        });

        test('should navigate to forgot password page', async ({ loginPage, page }) => {
            logTestStart('Navigate to forgot password');

            await loginPage.clickForgotPassword();
            await expect(page).toHaveURL(/.*requestPasswordResetCode.*/, { timeout: 15000 });

            logTestEnd('Navigate to forgot password', 'passed');
        });
    });

    test.describe('Negative Scenarios', () => {

        test('should show error for invalid credentials', async ({ loginPage, page }) => {
            logTestStart('Error for invalid credentials');

            await loginPage.login({ username: 'InvalidUser', password: 'wrongpass' });

            // Wait for error to appear (either alert or still on login page)
            await page.waitForTimeout(2000);
            const url = page.url();
            expect(url).toContain('login');

            logTestEnd('Error for invalid credentials', 'passed');
        });

        test('should show error for wrong password', async ({ loginPage, page }) => {
            logTestStart('Error for wrong password');

            await loginPage.login({ username: 'Admin', password: 'wrongpassword' });

            // Should stay on login page
            await page.waitForTimeout(2000);
            const url = page.url();
            expect(url).toContain('login');

            logTestEnd('Error for wrong password', 'passed');
        });

        test('should show validation for empty fields', async ({ page }) => {
            logTestStart('Validation for empty fields');

            const loginButton = page.locator('button[type="submit"]');
            await loginButton.click();

            // Check for validation message
            await page.waitForTimeout(1000);
            const errorMessage = page.locator('.oxd-input-field-error-message').first();
            const hasError = await errorMessage.isVisible();

            expect(hasError).toBeTruthy();

            logTestEnd('Validation for empty fields', 'passed');
        });

        test('should remain on login page after failed login', async ({ loginPage, page }) => {
            logTestStart('Remain on login page after failed login');

            await loginPage.login({ username: 'wrong', password: 'wrong' });

            // Verify still on login page
            await page.waitForTimeout(2000);
            await expect(page).toHaveURL(/.*login.*/);

            logTestEnd('Remain on login page after failed login', 'passed');
        });
    });

    test.describe('UI Elements', () => {

        test('should have username input visible', async ({ page }) => {
            logTestStart('Username input visible');

            const usernameInput = page.locator('input[name="username"]');
            await expect(usernameInput).toBeVisible();

            logTestEnd('Username input visible', 'passed');
        });

        test('should have password input visible', async ({ page }) => {
            logTestStart('Password input visible');

            const passwordInput = page.locator('input[name="password"]');
            await expect(passwordInput).toBeVisible();

            logTestEnd('Password input visible', 'passed');
        });

        test('should have forgot password link', async ({ page }) => {
            logTestStart('Forgot password link visible');

            const forgotLink = page.locator('.orangehrm-login-forgot-header');
            await expect(forgotLink).toBeVisible();

            logTestEnd('Forgot password link visible', 'passed');
        });
    });
});
