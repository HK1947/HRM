/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SIDEBAR COMPONENT - Composition Pattern
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Reusable sidebar navigation component.
 * WHY: Same sidebar appears on multiple pages - DRY principle.
 * IF NOT USED: Duplicated sidebar code in every page object.
 * INTERVIEW TIP: "Composition over inheritance - pages HAVE components, not ARE components"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Page, Locator } from '@playwright/test';
import { logStep } from '../../helpers';

export class SidebarComponent {
    private readonly page: Page;

    private readonly sidebar: Locator;
    private readonly menuItems: Locator;
    private readonly searchInput: Locator;
    private readonly collapseButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.sidebar = page.locator('.oxd-sidepanel');
        this.menuItems = page.locator('.oxd-main-menu-item');
        this.searchInput = page.locator('.oxd-main-menu-search input');
        this.collapseButton = page.locator('.oxd-sidepanel-toggle');
    }

    async navigateTo(menuName: string): Promise<void> {
        logStep(`Navigating to menu: ${menuName}`);
        const menuItem = this.menuItems.filter({ hasText: menuName });
        await menuItem.click();
        await this.page.waitForLoadState('networkidle');
    }

    async searchMenu(searchText: string): Promise<void> {
        logStep(`Searching menu: ${searchText}`);
        await this.searchInput.fill(searchText);
    }

    async collapse(): Promise<void> {
        logStep('Collapsing sidebar');
        const isExpanded = await this.sidebar.getAttribute('class');
        if (!isExpanded?.includes('toggled')) {
            await this.collapseButton.click();
        }
    }

    async expand(): Promise<void> {
        logStep('Expanding sidebar');
        const isExpanded = await this.sidebar.getAttribute('class');
        if (isExpanded?.includes('toggled')) {
            await this.collapseButton.click();
        }
    }

    async getMenuItems(): Promise<string[]> {
        const items = await this.menuItems.allInnerTexts();
        return items;
    }

    async isMenuVisible(menuName: string): Promise<boolean> {
        const menuItem = this.menuItems.filter({ hasText: menuName });
        return await menuItem.isVisible();
    }
}
