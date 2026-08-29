/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PAGE FIXTURES - Dependency Injection
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Playwright fixtures that inject page objects into tests.
 * WHY: Tests declare what they need, fixtures provide it - DI pattern.
 * IF NOT USED: Manual page object instantiation in every test.
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

export const pageFixtures = base.extend<PageFixtures>({
    loginPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        await use(loginPage);
    },

    dashboardPage: async ({ page }, use) => {
        const dashboardPage = new DashboardPage(page);
        await use(dashboardPage);
    },

    pimPage: async ({ page }, use) => {
        const pimPage = new PIMPage(page);
        await use(pimPage);
    },

    addEmployeePage: async ({ page }, use) => {
        const addEmployeePage = new AddEmployeePage(page);
        await use(addEmployeePage);
    }
});
