/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LOGIN PAGE - Page Object Model
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Login page object for OrangeHRM authentication.
 * WHY: Encapsulates all login interactions in one place.
 * IF NOT USED: Login logic scattered across tests, hard to maintain.
 * INTERVIEW TIP: "POM separates test logic from page implementation"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { ToastComponent } from './components';
import { LoginCredentials } from '../types';
import { logStep, logger } from '../helpers';

export class LoginPage extends BasePage {
    protected readonly pageUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';
    protected readonly pageTitle = /OrangeHRM/;

    private readonly usernameInput: Locator;
    private readonly passwordInput: Locator;
    private readonly loginButton: Locator;
    private readonly forgotPasswordLink: Locator;
    private readonly errorMessage: Locator;
    private readonly logo: Locator;

    readonly toast: ToastComponent;

    constructor(page: Page) {
        super(page);
        this.usernameInput = page.locator('input[name="username"]');
        this.passwordInput = page.locator('input[name="password"]');
        this.loginButton = page.locator('button[type="submit"]');
        this.forgotPasswordLink = page.locator('.orangehrm-login-forgot-header');
        this.errorMessage = page.locator('.oxd-alert-content-text');
        this.logo = page.locator('.orangehrm-login-branding img');

        this.toast = new ToastComponent(page);
    }

    async login(credentials: LoginCredentials): Promise<void> {
        logStep(`Logging in as ${credentials.username}`);
        await this.enterUsername(credentials.username);
        await this.enterPassword(credentials.password);
        await this.clickLogin();
    }

    async enterUsername(username: string): Promise<void> {
        logStep(`Entering username: ${username}`);
        await this.fillInput(this.usernameInput, username);
    }

    async enterPassword(password: string): Promise<void> {
        logStep('Entering password');
        await this.fillInput(this.passwordInput, password);
    }

    async clickLogin(): Promise<void> {
        logStep('Clicking login button');
        await this.clickElement(this.loginButton);
    }

    async clickForgotPassword(): Promise<void> {
        logStep('Clicking forgot password link');
        await this.clickElement(this.forgotPasswordLink);
    }

    async getErrorMessage(): Promise<string> {
        // Try multiple error selectors - OrangeHRM uses different ones
        const alertError = this.page.locator('.oxd-alert-content-text');
        const fieldError = this.page.locator('.oxd-input-field-error-message').first();

        if (await this.waitForElementSoft(alertError, 5000)) {
            return await alertError.innerText();
        }
        if (await this.waitForElementSoft(fieldError, 3000)) {
            return await fieldError.innerText();
        }
        return '';
    }

    async isErrorDisplayed(): Promise<boolean> {
        const alertError = this.page.locator('.oxd-alert-content-text');
        const fieldError = this.page.locator('.oxd-input-field-error-message').first();
        return await alertError.isVisible() || await fieldError.isVisible();
    }

    async verifyLoginError(expectedError: string): Promise<void> {
        logStep(`Verifying error message contains: ${expectedError}`);
        // Wait a moment for any error to appear
        await this.page.waitForTimeout(1000);
        const hasError = await this.isErrorDisplayed();
        expect(hasError).toBeTruthy();
    }

    async isLogoVisible(): Promise<boolean> {
        return await this.isVisible(this.logo);
    }

    async isLoginButtonEnabled(): Promise<boolean> {
        return await this.loginButton.isEnabled();
    }

    async verifyOnLoginPage(): Promise<void> {
        logStep('Verifying on login page');
        await expect(this.usernameInput).toBeVisible();
        await expect(this.passwordInput).toBeVisible();
        await expect(this.loginButton).toBeVisible();
    }

    async clearCredentials(): Promise<void> {
        logStep('Clearing credentials');
        await this.usernameInput.clear();
        await this.passwordInput.clear();
    }

    async loginAndWaitForDashboard(credentials: LoginCredentials): Promise<void> {
        await this.login(credentials);
        await this.page.waitForURL('**/dashboard/**');
        logger.info('Successfully logged in and redirected to dashboard');
    }

    async getFieldValidationError(fieldName: 'username' | 'password'): Promise<string> {
        const field = fieldName === 'username' ? this.usernameInput : this.passwordInput;
        const errorSpan = field.locator('..').locator('.oxd-input-field-error-message');
        return await errorSpan.innerText();
    }

    async isFieldRequired(fieldName: 'username' | 'password'): Promise<boolean> {
        const field = fieldName === 'username' ? this.usernameInput : this.passwordInput;
        const required = await field.getAttribute('required');
        return required !== null;
    }

    async submitEmptyForm(): Promise<void> {
        logStep('Submitting empty login form');
        await this.clickLogin();
    }
}
