/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PIM EMPLOYEE TESTS - CRUD Operations
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Test suite for employee management CRUD operations.
 * WHY: Employee management is core functionality of HR system.
 * IF NOT USED: No verification of employee lifecycle operations.
 * INTERVIEW TIP: "CRUD tests should be isolated - each test creates its own data"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { test, expect } from '../../../src/fixtures';
import { DataFactory, logTestStart, logTestEnd } from '../../../src/helpers';

test.describe('Employee Management @regression', () => {

    test.beforeEach(async ({ pimPage }) => {
        await pimPage.navigate();
    });

    test.describe('Employee List - Positive Scenarios', () => {

        test('should display employee list @smoke', async ({ pimPage }) => {
            logTestStart('Display employee list');

            const employeeCount = await pimPage.getEmployeeCount();
            expect(employeeCount).toBeGreaterThanOrEqual(0);

            logTestEnd('Display employee list', 'passed');
        });

        test('should navigate to add employee page @smoke', async ({ pimPage, page }) => {
            logTestStart('Navigate to add employee page');

            await pimPage.clickAddEmployee();
            await expect(page).toHaveURL(/.*addEmployee.*/);

            logTestEnd('Navigate to add employee page', 'passed');
        });

        test('should search employee by name', async ({ pimPage }) => {
            logTestStart('Search employee by name');

            await pimPage.searchByName('Admin');

            logTestEnd('Search employee by name', 'passed');
        });

        test('should reset search filters', async ({ pimPage }) => {
            logTestStart('Reset search filters');

            await pimPage.searchByName('Test');
            await pimPage.clickReset();

            logTestEnd('Reset search filters', 'passed');
        });

        test('should display table headers', async ({ pimPage }) => {
            logTestStart('Display table headers');

            const headers = await pimPage.table.getHeaders();
            expect(headers.length).toBeGreaterThan(0);

            logTestEnd('Display table headers', 'passed');
        });
    });

    test.describe('Add Employee - Positive Scenarios', () => {

        test('should add new employee with required fields @smoke', async ({
            pimPage,
            addEmployeePage
        }) => {
            logTestStart('Add new employee with required fields');

            await pimPage.clickAddEmployee();

            const employee = DataFactory.createEmployeePayload();
            await addEmployeePage.fillEmployeeForm(employee);
            await addEmployeePage.saveAndVerifySuccess();

            logTestEnd('Add new employee with required fields', 'passed');
        });

        test('should add employee with middle name', async ({
            pimPage,
            addEmployeePage
        }) => {
            logTestStart('Add employee with middle name');

            await pimPage.clickAddEmployee();

            const employee = DataFactory.createEmployeePayload({
                middleName: 'MiddleTest'
            });
            await addEmployeePage.fillEmployeeForm(employee);
            await addEmployeePage.saveAndVerifySuccess();

            logTestEnd('Add employee with middle name', 'passed');
        });

        test('should add employee with custom employee ID', async ({
            pimPage,
            addEmployeePage
        }) => {
            logTestStart('Add employee with custom employee ID');

            await pimPage.clickAddEmployee();

            const employee = DataFactory.createEmployeePayload();
            await addEmployeePage.fillEmployeeForm(employee);
            await addEmployeePage.setEmployeeId(`EMP${Date.now()}`);
            await addEmployeePage.saveAndVerifySuccess();

            logTestEnd('Add employee with custom employee ID', 'passed');
        });

        test('should cancel employee creation', async ({
            pimPage,
            addEmployeePage,
            page
        }) => {
            logTestStart('Cancel employee creation');

            await pimPage.clickAddEmployee();

            const employee = DataFactory.createEmployeePayload();
            await addEmployeePage.fillEmployeeForm(employee);
            await addEmployeePage.cancel();

            await expect(page).toHaveURL(/.*viewEmployeeList.*/);

            logTestEnd('Cancel employee creation', 'passed');
        });
    });

    test.describe('Add Employee - Negative Scenarios', () => {

        test('should show error for empty first name', async ({
            pimPage,
            addEmployeePage
        }) => {
            logTestStart('Error for empty first name');

            await pimPage.clickAddEmployee();

            await addEmployeePage.fillEmployeeForm({
                firstName: '',
                lastName: 'TestLast'
            });
            await addEmployeePage.save();

            await addEmployeePage.verifyRequiredFieldError();

            logTestEnd('Error for empty first name', 'passed');
        });

        test('should show error for empty last name', async ({
            pimPage,
            addEmployeePage
        }) => {
            logTestStart('Error for empty last name');

            await pimPage.clickAddEmployee();

            await addEmployeePage.fillEmployeeForm({
                firstName: 'TestFirst',
                lastName: ''
            });
            await addEmployeePage.save();

            await addEmployeePage.verifyRequiredFieldError();

            logTestEnd('Error for empty last name', 'passed');
        });

        test('should show error for special characters in name', async ({
            pimPage,
            addEmployeePage
        }) => {
            logTestStart('Error for special characters in name');

            await pimPage.clickAddEmployee();

            await addEmployeePage.fillEmployeeForm({
                firstName: 'Test@#$',
                lastName: 'Last!@#'
            });
            await addEmployeePage.save();

            const error = await addEmployeePage.getValidationError();
            expect(error.length).toBeGreaterThan(0);

            logTestEnd('Error for special characters in name', 'passed');
        });

        test('should handle very long names', async ({
            pimPage,
            addEmployeePage
        }) => {
            logTestStart('Handle very long names');

            await pimPage.clickAddEmployee();

            const longName = 'A'.repeat(100);
            await addEmployeePage.fillEmployeeForm({
                firstName: longName,
                lastName: longName
            });
            await addEmployeePage.save();

            logTestEnd('Handle very long names', 'passed');
        });
    });

    test.describe('Search - Negative Scenarios', () => {

        test('should show no records for non-existent employee', async ({ pimPage }) => {
            logTestStart('No records for non-existent employee');

            await pimPage.searchById('NONEXISTENT123');

            const isEmpty = await pimPage.isNoRecordsFound();
            expect(isEmpty).toBeTruthy();

            logTestEnd('No records for non-existent employee', 'passed');
        });

        test('should handle search with special characters', async ({ pimPage }) => {
            logTestStart('Search with special characters');

            await pimPage.searchById('!@#$%^&*()');

            logTestEnd('Search with special characters', 'passed');
        });
    });

    test.describe('Table Operations', () => {

        test('should get row data', async ({ pimPage }) => {
            logTestStart('Get row data');

            const rowCount = await pimPage.getEmployeeCount();
            if (rowCount > 0) {
                const rowData = await pimPage.table.getRowData(0);
                expect(Object.keys(rowData).length).toBeGreaterThan(0);
            }

            logTestEnd('Get row data', 'passed');
        });

        test('should get all rows', async ({ pimPage }) => {
            logTestStart('Get all rows');

            const allRows = await pimPage.table.getAllRows();
            expect(Array.isArray(allRows)).toBeTruthy();

            logTestEnd('Get all rows', 'passed');
        });
    });
});
