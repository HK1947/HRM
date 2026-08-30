/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PAGE FIXTURES - Dependency Injection
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Playwright fixtures that inject page objects into tests.
 * WHY: Tests declare what they need, fixtures provide it - DI pattern.
 * INTERVIEW TIP: "Fixtures are Playwright's DI mechanism - automatic setup/teardown"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { test as base } from '@playwright/test';
import { LoginPage, DashboardPage, PIMPage, AddEmployeePage } from '../pages';

export interface PageFixtures {
    loginPage: LoginPage;
    dashboardPage: DashboardPage;
    pimPage: PIMPage;
    addEmployeePage: AddEmployeePage;
}

async function ensureLoggedIn(page: any) {
    const url = page.url();
    if (url.includes('login') || url === 'about:blank') {
        const loginPage = new LoginPage(page);
        await loginPage.navigate();
        await loginPage.login({ username: 'Admin', password: 'admin123' });
        await page.waitForURL(/.*dashboard.*/, { timeout: 30000 });
    }
}

export const pageFixtures = base.extend<PageFixtures>({
    loginPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        await use(loginPage);
    },

    dashboardPage: async ({ page }, use) => {
        await ensureLoggedIn(page);
        const dashboardPage = new DashboardPage(page);
        await use(dashboardPage);
    },

    pimPage: async ({ page }, use) => {
        await ensureLoggedIn(page);
        const pimPage = new PIMPage(page);
        await use(pimPage);
    },

    addEmployeePage: async ({ page }, use) => {
        await ensureLoggedIn(page);
        const addEmployeePage = new AddEmployeePage(page);
        await use(addEmployeePage);
    }
});
