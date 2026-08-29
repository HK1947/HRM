/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PIM PAGE - Employee Management
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: PIM (Personnel Information Management) list page.
 * WHY: Central hub for employee CRUD operations.
 * IF NOT USED: Employee management logic duplicated.
 * INTERVIEW TIP: "PIM shows table component composition in action"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { TableComponent, ToastComponent, SidebarComponent } from '../components';
import { logStep } from '../../helpers';

export class PIMPage extends BasePage {
    protected readonly pageUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewEmployeeList';
    protected readonly pageTitle = /OrangeHRM/;

    private readonly addButton: Locator;
    private readonly searchEmployeeName: Locator;
    private readonly searchEmployeeId: Locator;
    private readonly searchButton: Locator;
    private readonly resetButton: Locator;

    readonly table: TableComponent;
    readonly toast: ToastComponent;
    readonly sidebar: SidebarComponent;

    constructor(page: Page) {
        super(page);
        this.addButton = page.locator('button:has-text("Add")');
        this.searchEmployeeName = page.locator('.oxd-autocomplete-text-input input').first();
        this.searchEmployeeId = page.locator('.oxd-input').nth(1);
        this.searchButton = page.locator('button[type="submit"]');
        this.resetButton = page.locator('button:has-text("Reset")');

        this.table = new TableComponent(page);
        this.toast = new ToastComponent(page);
        this.sidebar = new SidebarComponent(page);
    }

    async clickAddEmployee(): Promise<void> {
        logStep('Clicking Add Employee button');
        await this.clickElement(this.addButton);
        await this.page.waitForURL('**/addEmployee');
    }

    async searchByName(name: string): Promise<void> {
        logStep(`Searching employee by name: ${name}`);
        await this.fillInput(this.searchEmployeeName, name);
        await this.page.waitForTimeout(500);
        const suggestion = this.page.locator('.oxd-autocomplete-option').first();
        if (await suggestion.isVisible()) {
            await suggestion.click();
        }
        await this.clickSearch();
    }

    async searchById(employeeId: string): Promise<void> {
        logStep(`Searching employee by ID: ${employeeId}`);
        await this.fillInput(this.searchEmployeeId, employeeId);
        await this.clickSearch();
    }

    async clickSearch(): Promise<void> {
        await this.clickElement(this.searchButton);
        await this.page.waitForLoadState('networkidle');
    }

    async clickReset(): Promise<void> {
        logStep('Resetting search filters');
        await this.clickElement(this.resetButton);
        await this.page.waitForLoadState('networkidle');
    }

    async getEmployeeCount(): Promise<number> {
        return await this.table.getRowCount();
    }

    async deleteEmployee(rowIndex: number): Promise<void> {
        logStep(`Deleting employee at row ${rowIndex}`);
        await this.table.deleteRow(rowIndex);
        const confirmButton = this.page.locator('.oxd-button--label-danger');
        await confirmButton.click();
        await this.toast.waitForToast('success');
    }

    async editEmployee(rowIndex: number): Promise<void> {
        logStep(`Editing employee at row ${rowIndex}`);
        await this.table.editRow(rowIndex);
        await this.page.waitForURL('**/viewPersonalDetails/**');
    }

    async verifyEmployeeInList(name: string): Promise<void> {
        const rows = await this.table.getAllRows();
        const found = rows.some(row =>
            Object.values(row).some(value => value.includes(name))
        );
        expect(found).toBeTruthy();
    }

    async isNoRecordsFound(): Promise<boolean> {
        return await this.table.isTableEmpty();
    }
}
