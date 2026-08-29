/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TOAST COMPONENT - Composition Pattern
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Toast notification handler.
 * WHY: Success/error toasts appear after every action.
 * IF NOT USED: Duplicated toast verification logic.
 * INTERVIEW TIP: "Toasts are async UI feedback - must wait for them"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Page, Locator, expect } from '@playwright/test';
import { logStep } from '../../helpers';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export class ToastComponent {
    private readonly toastContainer: Locator;
    private readonly successToast: Locator;
    private readonly errorToast: Locator;
    private readonly warningToast: Locator;
    private readonly toastMessage: Locator;
    private readonly closeButton: Locator;

    constructor(page: Page) {
        this.toastContainer = page.locator('.oxd-toast-container');
        this.successToast = page.locator('.oxd-toast--success');
        this.errorToast = page.locator('.oxd-toast--error');
        this.warningToast = page.locator('.oxd-toast--warn');
        this.toastMessage = page.locator('.oxd-toast-content-text');
        this.closeButton = page.locator('.oxd-toast-close');
    }

    async waitForToast(type: ToastType = 'success', timeout = 10000): Promise<void> {
        logStep(`Waiting for ${type} toast`);
        const toastLocator = this.getToastByType(type);
        await toastLocator.waitFor({ state: 'visible', timeout });
    }

    private getToastByType(type: ToastType): Locator {
        switch (type) {
            case 'success':
                return this.successToast;
            case 'error':
                return this.errorToast;
            case 'warning':
                return this.warningToast;
            default:
                return this.toastContainer.locator('.oxd-toast');
        }
    }

    async getMessage(): Promise<string> {
        await this.toastMessage.waitFor({ state: 'visible' });
        return await this.toastMessage.innerText();
    }

    async verifySuccessMessage(expectedMessage: string): Promise<void> {
        logStep(`Verifying success message: ${expectedMessage}`);
        await this.waitForToast('success');
        const message = await this.getMessage();
        expect(message).toContain(expectedMessage);
    }

    async verifyErrorMessage(expectedMessage: string): Promise<void> {
        logStep(`Verifying error message: ${expectedMessage}`);
        await this.waitForToast('error');
        const message = await this.getMessage();
        expect(message).toContain(expectedMessage);
    }

    async close(): Promise<void> {
        logStep('Closing toast');
        if (await this.closeButton.isVisible()) {
            await this.closeButton.click();
        }
    }

    async waitForToastToDisappear(timeout = 10000): Promise<void> {
        logStep('Waiting for toast to disappear');
        await this.toastContainer.locator('.oxd-toast').waitFor({
            state: 'hidden',
            timeout
        });
    }

    async isVisible(): Promise<boolean> {
        return await this.toastContainer.locator('.oxd-toast').isVisible();
    }
}
