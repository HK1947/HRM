/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BASE PAGE - Template Method Pattern
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Abstract base class for all page objects.
 * WHY: DRY - common operations defined once, pages inherit.
 * IF NOT USED: Duplicated waitForLoad, screenshot, navigation in every page.
 * INTERVIEW TIP: "Template Method defines skeleton in base class, subclasses fill in steps"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Page, Locator, expect } from '@playwright/test';
import { logger, logStep } from '../helpers';
import { selfHealingLocator, LocatorContext } from '../helpers';

export abstract class BasePage {
    protected readonly page: Page;
    protected abstract readonly pageUrl: string;
    protected abstract readonly pageTitle: string | RegExp;

    constructor(page: Page) {
        this.page = page;
    }

    async navigate(): Promise<void> {
        logStep(`Navigating to ${this.pageUrl}`);
        await this.page.goto(this.pageUrl);
        await this.waitForPageLoad();
    }

    async waitForPageLoad(): Promise<void> {
        logStep('Waiting for page load');
        await this.page.waitForLoadState('networkidle');
        await this.verifyPage();
    }

    async verifyPage(): Promise<void> {
        logStep('Verifying page title');
        await expect(this.page).toHaveTitle(this.pageTitle);
    }

    async getCurrentUrl(): Promise<string> {
        return this.page.url();
    }

    async takeScreenshot(name: string): Promise<Buffer> {
        logStep(`Taking screenshot: ${name}`);
        return await this.page.screenshot({
            path: `test-results/screenshots/${name}.png`,
            fullPage: true
        });
    }

    async waitForElement(locator: Locator, timeout = 30000): Promise<void> {
        await locator.waitFor({ state: 'visible', timeout });
    }

    async waitForElementSoft(locator: Locator, timeout = 5000): Promise<boolean> {
        try {
            await locator.waitFor({ state: 'visible', timeout });
            return true;
        } catch {
            return false;
        }
    }

    async clickElement(locator: Locator): Promise<void> {
        await this.waitForElement(locator);
        await locator.click();
    }

    async fillInput(locator: Locator, value: string): Promise<void> {
        await this.waitForElement(locator);
        await locator.clear();
        await locator.fill(value);
    }

    async getText(locator: Locator): Promise<string> {
        await this.waitForElement(locator);
        return await locator.innerText();
    }

    async isVisible(locator: Locator): Promise<boolean> {
        return await locator.isVisible();
    }

    async findWithHealing(
        context: LocatorContext,
        elementName: string
    ): Promise<Locator> {
        const result = await selfHealingLocator.findElement(
            this.page,
            context,
            elementName
        );
        return result.locator;
    }

    async selectOption(locator: Locator, value: string): Promise<void> {
        await this.waitForElement(locator);
        await locator.selectOption(value);
    }

    async pressKey(key: string): Promise<void> {
        await this.page.keyboard.press(key);
    }

    async waitForNavigation(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
    }

    async acceptDialog(): Promise<void> {
        this.page.on('dialog', async dialog => {
            logger.info(`Dialog message: ${dialog.message()}`);
            await dialog.accept();
        });
    }

    async dismissDialog(): Promise<void> {
        this.page.on('dialog', async dialog => {
            logger.info(`Dialog dismissed: ${dialog.message()}`);
            await dialog.dismiss();
        });
    }

    async scrollToElement(locator: Locator): Promise<void> {
        await locator.scrollIntoViewIfNeeded();
    }

    async hover(locator: Locator): Promise<void> {
        await this.waitForElement(locator);
        await locator.hover();
    }

    async getAttributeValue(locator: Locator, attribute: string): Promise<string | null> {
        return await locator.getAttribute(attribute);
    }

    async waitForElementToDisappear(locator: Locator, timeout = 10000): Promise<void> {
        await locator.waitFor({ state: 'hidden', timeout });
    }
}
