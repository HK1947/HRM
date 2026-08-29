/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TABLE COMPONENT - Composition Pattern
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Reusable data table component with sorting, filtering, actions.
 * WHY: Tables appear everywhere - employees, leaves, etc.
 * IF NOT USED: Table logic duplicated across pages.
 * INTERVIEW TIP: "Components encapsulate behavior - table knows how to sort itself"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Page, Locator } from '@playwright/test';
import { logStep } from '../../helpers';

export interface TableRow {
    [key: string]: string;
}

export class TableComponent {
    private readonly page: Page;

    private readonly table: Locator;
    private readonly headers: Locator;
    private readonly rows: Locator;
    private readonly pagination: Locator;

    constructor(page: Page, tableSelector = '.oxd-table') {
        this.page = page;
        this.table = page.locator(tableSelector);
        this.headers = this.table.locator('.oxd-table-header-cell');
        this.rows = this.table.locator('.oxd-table-card');
        this.pagination = page.locator('.oxd-table-pager');
    }

    async getRowCount(): Promise<number> {
        return await this.rows.count();
    }

    async getHeaders(): Promise<string[]> {
        return await this.headers.allInnerTexts();
    }

    async getRowData(rowIndex: number): Promise<TableRow> {
        const row = this.rows.nth(rowIndex);
        const cells = await row.locator('.oxd-table-cell').allInnerTexts();
        const headers = await this.getHeaders();

        const rowData: TableRow = {};
        headers.forEach((header, index) => {
            if (cells[index]) {
                rowData[header.trim()] = cells[index].trim();
            }
        });
        return rowData;
    }

    async getAllRows(): Promise<TableRow[]> {
        const rowCount = await this.getRowCount();
        const allRows: TableRow[] = [];

        for (let i = 0; i < rowCount; i++) {
            allRows.push(await this.getRowData(i));
        }
        return allRows;
    }

    async clickRowAction(rowIndex: number, actionIndex: number): Promise<void> {
        logStep(`Clicking action ${actionIndex} on row ${rowIndex}`);
        const row = this.rows.nth(rowIndex);
        const action = row.locator('.oxd-table-cell-actions button').nth(actionIndex);
        await action.click();
    }

    async deleteRow(rowIndex: number): Promise<void> {
        logStep(`Deleting row ${rowIndex}`);
        await this.clickRowAction(rowIndex, 0);
    }

    async editRow(rowIndex: number): Promise<void> {
        logStep(`Editing row ${rowIndex}`);
        await this.clickRowAction(rowIndex, 1);
    }

    async selectRow(rowIndex: number): Promise<void> {
        logStep(`Selecting row ${rowIndex}`);
        const checkbox = this.rows.nth(rowIndex).locator('input[type="checkbox"]');
        await checkbox.check();
    }

    async selectAllRows(): Promise<void> {
        logStep('Selecting all rows');
        const selectAll = this.table.locator('.oxd-table-header input[type="checkbox"]');
        await selectAll.check();
    }

    async searchInTable(searchText: string): Promise<void> {
        logStep(`Searching in table: ${searchText}`);
        const searchInput = this.page.locator('.oxd-table-filter input').first();
        await searchInput.fill(searchText);
        await this.page.keyboard.press('Enter');
        await this.page.waitForLoadState('networkidle');
    }

    async sortByColumn(columnName: string): Promise<void> {
        logStep(`Sorting by column: ${columnName}`);
        const header = this.headers.filter({ hasText: columnName });
        await header.click();
    }

    async goToPage(pageNumber: number): Promise<void> {
        logStep(`Going to page ${pageNumber}`);
        const pageButton = this.pagination.locator(`button:has-text("${pageNumber}")`);
        await pageButton.click();
    }

    async isTableEmpty(): Promise<boolean> {
        const noRecords = this.page.locator('.oxd-table-card >> text=No Records Found');
        return await noRecords.isVisible();
    }
}
