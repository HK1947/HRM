/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LOGIN TESTS - Authentication Scenarios
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Comprehensive login test suite with positive and negative scenarios.
 * WHY: Authentication is critical - must work perfectly.
 * IF NOT USED: No verification of login functionality.
 * INTERVIEW TIP: "Always test both happy path AND error scenarios"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { test, expect } from '../../../src/fixtures';
import { DataFactory, logTestStart, logTestEnd } from '../../../src/helpers';

test.describe('Login Functionality @regression', () => {

    test.beforeEach(async ({ loginPage }) => {
        await loginPage.navigate();
    });

    test.describe('Positive Scenarios', () => {

        test('should login with valid credentials @smoke', async ({ loginPage, page }) => {
            logTestStart('Login with valid credentials');

            const credentials = DataFactory.createLoginCredentials();
            await loginPage.login(credentials);

            await expect(page).toHaveURL(/.*dashboard.*/);
            logTestEnd('Login with valid credentials', 'passed');
        });

        test('should display logo on login page', async ({ loginPage }) => {
            logTestStart('Display logo on login page');

            const isLogoVisible = await loginPage.isLogoVisible();
            expect(isLogoVisible).toBeTruthy();

            logTestEnd('Display logo on login page', 'passed');
        });

        test('should have enabled login button', async ({ loginPage }) => {
            logTestStart('Login button enabled');

            const isEnabled = await loginPage.isLoginButtonEnabled();
            expect(isEnabled).toBeTruthy();

            logTestEnd('Login button enabled', 'passed');
        });

        test('should navigate to forgot password page', async ({ loginPage, page }) => {
            logTestStart('Navigate to forgot password');

            await loginPage.clickForgotPassword();
            await expect(page).toHaveURL(/.*requestPasswordResetCode.*/);

            logTestEnd('Navigate to forgot password', 'passed');
        });

        test('should redirect to dashboard after login @smoke', async ({ loginPage, page }) => {
            logTestStart('Redirect to dashboard after login');

            const credentials = DataFactory.createLoginCredentials();
            await loginPage.loginAndWaitForDashboard(credentials);

            await expect(page).toHaveURL(/.*dashboard.*/);

            logTestEnd('Redirect to dashboard after login', 'passed');
        });
    });

    test.describe('Negative Scenarios', () => {

        test('should show error for invalid username', async ({ loginPage }) => {
            logTestStart('Error for invalid username');

            const credentials = DataFactory.createInvalidLoginCredentials();
            await loginPage.login(credentials);

            await loginPage.verifyLoginError('Invalid credentials');

            logTestEnd('Error for invalid username', 'passed');
        });

        test('should show error for invalid password', async ({ loginPage }) => {
            logTestStart('Error for invalid password');

            await loginPage.login({
                username: 'Admin',
                password: 'wrongpassword'
            });

            await loginPage.verifyLoginError('Invalid credentials');

            logTestEnd('Error for invalid password', 'passed');
        });

        test('should show error for empty username', async ({ loginPage }) => {
            logTestStart('Error for empty username');

            await loginPage.enterPassword('admin123');
            await loginPage.clickLogin();

            const isErrorDisplayed = await loginPage.isErrorDisplayed();
            expect(isErrorDisplayed).toBeTruthy();

            logTestEnd('Error for empty username', 'passed');
        });

        test('should show error for empty password', async ({ loginPage }) => {
            logTestStart('Error for empty password');

            await loginPage.enterUsername('Admin');
            await loginPage.clickLogin();

            const isErrorDisplayed = await loginPage.isErrorDisplayed();
            expect(isErrorDisplayed).toBeTruthy();

            logTestEnd('Error for empty password', 'passed');
        });

        test('should show error for empty form submission', async ({ loginPage }) => {
            logTestStart('Error for empty form submission');

            await loginPage.submitEmptyForm();

            const isErrorDisplayed = await loginPage.isErrorDisplayed();
            expect(isErrorDisplayed).toBeTruthy();

            logTestEnd('Error for empty form submission', 'passed');
        });

        test('should show error for SQL injection attempt', async ({ loginPage }) => {
            logTestStart('Error for SQL injection attempt');

            await loginPage.login({
                username: "' OR '1'='1",
                password: "' OR '1'='1"
            });

            await loginPage.verifyLoginError('Invalid credentials');

            logTestEnd('Error for SQL injection attempt', 'passed');
        });

        test('should show error for XSS attempt', async ({ loginPage }) => {
            logTestStart('Error for XSS attempt');

            await loginPage.login({
                username: '<script>alert("xss")</script>',
                password: 'password'
            });

            await loginPage.verifyLoginError('Invalid credentials');

            logTestEnd('Error for XSS attempt', 'passed');
        });

        test('should not login with case-sensitive username', async ({ loginPage }) => {
            logTestStart('Case-sensitive username check');

            await loginPage.login({
                username: 'admin',
                password: 'admin123'
            });

            const isErrorDisplayed = await loginPage.isErrorDisplayed();
            expect(isErrorDisplayed).toBeTruthy();

            logTestEnd('Case-sensitive username check', 'passed');
        });

        test('should handle special characters in password', async ({ loginPage }) => {
            logTestStart('Special characters in password');

            await loginPage.login({
                username: 'Admin',
                password: '!@#$%^&*()'
            });

            await loginPage.verifyLoginError('Invalid credentials');

            logTestEnd('Special characters in password', 'passed');
        });

        test('should remain on login page after failed login', async ({ loginPage, page }) => {
            logTestStart('Remain on login page after failed login');

            const invalidCredentials = DataFactory.createInvalidLoginCredentials();
            await loginPage.login(invalidCredentials);

            await expect(page).toHaveURL(/.*login.*/);

            logTestEnd('Remain on login page after failed login', 'passed');
        });
    });

    test.describe('Edge Cases', () => {

        test('should clear credentials when clicking clear', async ({ loginPage }) => {
            logTestStart('Clear credentials');

            await loginPage.enterUsername('testuser');
            await loginPage.enterPassword('testpass');
            await loginPage.clearCredentials();

            await loginPage.verifyOnLoginPage();

            logTestEnd('Clear credentials', 'passed');
        });

        test('should handle very long username', async ({ loginPage }) => {
            logTestStart('Very long username');

            const longUsername = 'a'.repeat(200);
            await loginPage.login({
                username: longUsername,
                password: 'admin123'
            });

            const isErrorDisplayed = await loginPage.isErrorDisplayed();
            expect(isErrorDisplayed).toBeTruthy();

            logTestEnd('Very long username', 'passed');
        });

        test('should handle whitespace in credentials', async ({ loginPage }) => {
            logTestStart('Whitespace in credentials');

            await loginPage.login({
                username: '  Admin  ',
                password: 'admin123'
            });

            const isErrorDisplayed = await loginPage.isErrorDisplayed();
            expect(isErrorDisplayed).toBeTruthy();

            logTestEnd('Whitespace in credentials', 'passed');
        });
    });
});
