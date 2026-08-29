/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AUTH FIXTURES - Storage State Authentication
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Fixtures that handle authentication state.
 * WHY: Reuse authenticated state across tests - faster execution.
 * IF NOT USED: Login in every test = slow test suite.
 * INTERVIEW TIP: "storageState saves cookies/localStorage - no login per test"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { test as base, Page, BrowserContext } from '@playwright/test';
import { LoginPage } from '../pages';
import { DataFactory, logger } from '../helpers';

export interface AuthFixtures {
    authenticatedPage: Page;
    authenticatedContext: BrowserContext;
}

export const authFixtures = base.extend<AuthFixtures>({
    authenticatedPage: async ({ browser }, use) => {
        const context = await browser.newContext({
            storageState: 'auth/admin.json'
        });
        const page = await context.newPage();

        try {
            await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index');
            await page.waitForLoadState('networkidle');
        } catch {
            logger.warn('Storage state invalid, performing fresh login');
            await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
            const loginPage = new LoginPage(page);
            const credentials = DataFactory.createLoginCredentials();
            await loginPage.login(credentials);
            await page.waitForURL('**/dashboard/**');
        }

        await use(page);
        await context.close();
    },

    authenticatedContext: async ({ browser }, use) => {
        const context = await browser.newContext({
            storageState: 'auth/admin.json'
        });

        await use(context);
        await context.close();
    }
});
