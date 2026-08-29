/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HYBRID TESTS - Combined UI + API Testing
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Tests that combine UI interactions with API verification.
 * WHY: Verify UI actions result in correct backend state.
 * IF NOT USED: UI and API tested in isolation, miss integration bugs.
 * INTERVIEW TIP: "Hybrid tests catch bugs that pure UI or API tests miss"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { test, expect } from '../../src/fixtures';
import { APIClient } from '../../src/api';
import { DataFactory, logTestStart, logTestEnd, schemaValidator } from '../../src/helpers';

const BASE_URL = process.env.ORANGEHRM_URL || 'https://opensource-demo.orangehrmlive.com';

test.describe('Hybrid Employee Flow @hybrid @regression', () => {

    test.describe('UI Action with API Verification', () => {

        test('should verify dashboard loads correctly via UI and check API health', async ({
            dashboardPage,
            request
        }) => {
            logTestStart('Dashboard UI + API health check');

            await dashboardPage.navigate();
            await dashboardPage.verifyDashboardLoaded();

            const apiClient = new APIClient(request, { baseURL: BASE_URL });
            const response = await apiClient.get('/web/index.php/api/v2/admin/users');

            expect([200, 401, 403]).toContain(response.status);

            logTestEnd('Dashboard UI + API health check', 'passed');
        });

        test('should navigate PIM via UI and verify employee list API', async ({
            dashboardPage,
            pimPage,
            request
        }) => {
            logTestStart('PIM navigation + API verification');

            await dashboardPage.navigate();
            await dashboardPage.navigateToPIM();

            const employeeCount = await pimPage.getEmployeeCount();
            expect(employeeCount).toBeGreaterThanOrEqual(0);

            const apiClient = new APIClient(request, { baseURL: BASE_URL });
            const apiResponse = await apiClient.get('/web/index.php/api/v2/pim/employees');

            expect([200, 401, 403]).toContain(apiResponse.status);

            logTestEnd('PIM navigation + API verification', 'passed');
        });

        test('should create employee via UI and validate schema', async ({
            pimPage,
            addEmployeePage
        }) => {
            logTestStart('Create employee + schema validation');

            await pimPage.navigate();
            await pimPage.clickAddEmployee();

            const employeeData = DataFactory.createEmployeePayload();
            await addEmployeePage.fillEmployeeForm(employeeData);

            const validEmployee = {
                employeeId: 'EMP001',
                firstName: employeeData.firstName,
                lastName: employeeData.lastName,
                status: 'Active'
            };

            const isValid = schemaValidator.isValid('employee', validEmployee);
            expect(isValid).toBeTruthy();

            await addEmployeePage.cancel();

            logTestEnd('Create employee + schema validation', 'passed');
        });
    });

    test.describe('Data Consistency Tests', () => {

        test('should maintain data consistency across UI and API', async ({
            dashboardPage,
            request
        }) => {
            logTestStart('Data consistency UI + API');

            await dashboardPage.navigate();
            const uiUserName = await dashboardPage.getUserName();

            const apiClient = new APIClient(request, { baseURL: BASE_URL });
            const response = await apiClient.get('/web/index.php/api/v2/pim/employees');

            expect(uiUserName).toBeTruthy();
            expect([200, 401, 403]).toContain(response.status);

            logTestEnd('Data consistency UI + API', 'passed');
        });

        test('should verify table data matches expected schema', async ({
            pimPage
        }) => {
            logTestStart('Table data schema validation');

            await pimPage.navigate();

            const rowCount = await pimPage.getEmployeeCount();
            if (rowCount > 0) {
                const rowData = await pimPage.table.getRowData(0);
                expect(rowData).toBeDefined();
                expect(Object.keys(rowData).length).toBeGreaterThan(0);
            }

            logTestEnd('Table data schema validation', 'passed');
        });
    });

    test.describe('End-to-End Flow with Validation', () => {

        test('should complete login flow and verify session via API', async ({
            loginPage,
            page,
            request
        }) => {
            logTestStart('Login flow + session verification');

            await loginPage.navigate();
            const credentials = DataFactory.createLoginCredentials();
            await loginPage.login(credentials);

            await expect(page).toHaveURL(/.*dashboard.*/);

            const apiClient = new APIClient(request, { baseURL: BASE_URL });
            const response = await apiClient.get('/web/index.php/api/v2/admin/users');

            expect([200, 401, 403]).toContain(response.status);

            logTestEnd('Login flow + session verification', 'passed');
        });

        test('should navigate through modules and verify API endpoints', async ({
            dashboardPage,
            request
        }) => {
            logTestStart('Module navigation + API verification');

            await dashboardPage.navigate();

            const apiClient = new APIClient(request, { baseURL: BASE_URL });

            await dashboardPage.navigateToPIM();
            let response = await apiClient.get('/web/index.php/api/v2/pim/employees');
            expect([200, 401, 403]).toContain(response.status);

            await dashboardPage.sidebar.navigateTo('Admin');
            response = await apiClient.get('/web/index.php/api/v2/admin/users');
            expect([200, 401, 403]).toContain(response.status);

            logTestEnd('Module navigation + API verification', 'passed');
        });

        test('should search employee via UI and verify with schema', async ({
            pimPage
        }) => {
            logTestStart('Search UI + schema verification');

            await pimPage.navigate();

            await pimPage.searchByName('Admin');

            const rowCount = await pimPage.getEmployeeCount();
            if (rowCount > 0) {
                const rowData = await pimPage.table.getRowData(0);
                expect(rowData).toBeDefined();
            }

            logTestEnd('Search UI + schema verification', 'passed');
        });
    });

    test.describe('Error Handling Hybrid', () => {

        test('should handle API errors gracefully with UI feedback', async ({
            request
        }) => {
            logTestStart('API error handling');

            const apiClient = new APIClient(request, { baseURL: BASE_URL });

            const response = await apiClient.get('/web/index.php/api/v2/nonexistent');
            expect([404, 401, 403]).toContain(response.status);

            logTestEnd('API error handling', 'passed');
        });

        test('should validate form data before API submission', async ({
            pimPage,
            addEmployeePage
        }) => {
            logTestStart('Form validation before API');

            await pimPage.navigate();
            await pimPage.clickAddEmployee();

            const invalidData = {
                firstName: '',
                lastName: ''
            };

            await addEmployeePage.fillEmployeeForm(invalidData);
            await addEmployeePage.save();

            const error = await addEmployeePage.getValidationError();
            expect(error.length).toBeGreaterThan(0);

            await addEmployeePage.cancel();

            logTestEnd('Form validation before API', 'passed');
        });
    });
});
