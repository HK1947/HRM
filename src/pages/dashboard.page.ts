/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DASHBOARD PAGE - Page Object Model
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Dashboard page object for OrangeHRM main screen.
 * WHY: Encapsulates dashboard widgets, quick actions, and navigation.
 * IF NOT USED: Dashboard interactions scattered across tests.
 * INTERVIEW TIP: "Dashboard is the hub - all navigation flows through here"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { SidebarComponent, ToastComponent } from './components';
import { logStep } from '../helpers';

export class DashboardPage extends BasePage {
    protected readonly pageUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index';
    protected readonly pageTitle = /OrangeHRM/;

    private readonly dashboardGrid: Locator;
    private readonly quickLaunchWidgets: Locator;
    private readonly timeAtWorkWidget: Locator;
    private readonly employeeDistributionChart: Locator;
    private readonly userDropdown: Locator;
    private readonly logoutLink: Locator;

    readonly sidebar: SidebarComponent;
    readonly toast: ToastComponent;

    constructor(page: Page) {
        super(page);
        this.dashboardGrid = page.locator('.oxd-grid-container');
        this.quickLaunchWidgets = page.locator('.orangehrm-quick-launch-card');
        this.timeAtWorkWidget = page.locator('.orangehrm-attendance-card');
        this.employeeDistributionChart = page.locator('.orangehrm-distribution-chart');
        this.userDropdown = page.locator('.oxd-userdropdown');
        this.logoutLink = page.locator('a:has-text("Logout")');

        this.sidebar = new SidebarComponent(page);
        this.toast = new ToastComponent(page);
    }

    async verifyDashboardLoaded(): Promise<void> {
        logStep('Verifying dashboard is loaded');
        await expect(this.dashboardGrid).toBeVisible();
    }

    async getQuickLaunchCount(): Promise<number> {
        return await this.quickLaunchWidgets.count();
    }

    async clickQuickLaunch(index: number): Promise<void> {
        logStep(`Clicking quick launch widget ${index}`);
        await this.quickLaunchWidgets.nth(index).click();
    }

    async isTimeWidgetVisible(): Promise<boolean> {
        return await this.timeAtWorkWidget.isVisible();
    }

    async isChartVisible(): Promise<boolean> {
        return await this.employeeDistributionChart.isVisible();
    }

    async openUserMenu(): Promise<void> {
        logStep('Opening user dropdown menu');
        await this.clickElement(this.userDropdown);
    }

    async logout(): Promise<void> {
        logStep('Logging out');
        await this.openUserMenu();
        await this.clickElement(this.logoutLink);
        await this.page.waitForURL('**/auth/login');
    }

    async getUserName(): Promise<string> {
        const nameElement = this.userDropdown.locator('.oxd-userdropdown-name');
        return await nameElement.innerText();
    }

    async navigateToPIM(): Promise<void> {
        await this.sidebar.navigateTo('PIM');
    }

    async navigateToLeave(): Promise<void> {
        await this.sidebar.navigateTo('Leave');
    }

    async navigateToAdmin(): Promise<void> {
        await this.sidebar.navigateTo('Admin');
    }

    async navigateToTime(): Promise<void> {
        await this.sidebar.navigateTo('Time');
    }

    async navigateToRecruitment(): Promise<void> {
        await this.sidebar.navigateTo('Recruitment');
    }

    async navigateToMyInfo(): Promise<void> {
        await this.sidebar.navigateTo('My Info');
    }
}
