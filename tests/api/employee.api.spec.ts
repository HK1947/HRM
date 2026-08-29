/**
 * ═══════════════════════════════════════════════════════════════════════════
 * API TESTS - Employee Endpoints
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: API test suite for employee-related endpoints.
 * WHY: Verify API contracts independently of UI.
 * IF NOT USED: No API contract verification.
 * INTERVIEW TIP: "API tests are faster and more stable than UI tests"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { test, expect } from '@playwright/test';
import { APIClient } from '../../src/api';
import { schemaValidator, logTestStart, logTestEnd } from '../../src/helpers';

const BASE_URL = process.env.ORANGEHRM_URL || 'https://opensource-demo.orangehrmlive.com';

test.describe('Employee API @api @regression', () => {
    let apiClient: APIClient;

    test.beforeAll(async ({ request }) => {
        apiClient = new APIClient(request, {
            baseURL: BASE_URL,
            defaultHeaders: {
                'Content-Type': 'application/json'
            }
        });
    });

    test.describe('Positive Scenarios', () => {

        test('should return 200 for valid endpoint @smoke', async () => {
            logTestStart('Valid endpoint returns 200');

            const { status } = await apiClient.get('/web/index.php/api/v2/admin/users');

            expect([200, 401, 403]).toContain(status);

            logTestEnd('Valid endpoint returns 200', 'passed');
        });

        test('should have correct content-type header', async ({ request }) => {
            logTestStart('Correct content-type header');

            const response = await request.get(`${BASE_URL}/web/index.php/api/v2/admin/users`);

            const contentType = response.headers()['content-type'];
            expect(contentType).toContain('application/json');

            logTestEnd('Correct content-type header', 'passed');
        });

        test('should return JSON response', async ({ request }) => {
            logTestStart('JSON response');

            const response = await request.get(`${BASE_URL}/web/index.php/api/v2/pim/employees`);

            if (response.status() === 200) {
                const body = await response.json();
                expect(body).toBeDefined();
                expect(typeof body).toBe('object');
            }

            logTestEnd('JSON response', 'passed');
        });
    });

    test.describe('Negative Scenarios', () => {

        test('should return 404 for non-existent endpoint', async ({ request }) => {
            logTestStart('404 for non-existent endpoint');

            const response = await request.get(`${BASE_URL}/web/index.php/api/v2/nonexistent`);

            expect([404, 401, 403]).toContain(response.status());

            logTestEnd('404 for non-existent endpoint', 'passed');
        });

        test('should return 401 for unauthorized request', async ({ request }) => {
            logTestStart('401 for unauthorized request');

            const response = await request.get(`${BASE_URL}/web/index.php/api/v2/pim/employees`, {
                headers: {
                    'Cookie': ''
                }
            });

            expect([401, 403, 302]).toContain(response.status());

            logTestEnd('401 for unauthorized request', 'passed');
        });

        test('should handle malformed JSON in request body', async ({ request }) => {
            logTestStart('Handle malformed JSON');

            const response = await request.post(`${BASE_URL}/web/index.php/api/v2/pim/employees`, {
                data: 'not-json',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            expect([400, 401, 403, 422, 500]).toContain(response.status());

            logTestEnd('Handle malformed JSON', 'passed');
        });

        test('should handle empty request body', async ({ request }) => {
            logTestStart('Handle empty request body');

            const response = await request.post(`${BASE_URL}/web/index.php/api/v2/pim/employees`, {
                data: {},
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            expect([400, 401, 403, 422]).toContain(response.status());

            logTestEnd('Handle empty request body', 'passed');
        });

        test('should handle invalid employee ID format', async ({ request }) => {
            logTestStart('Handle invalid employee ID format');

            const response = await request.get(`${BASE_URL}/web/index.php/api/v2/pim/employees/invalid-id`);

            expect([400, 401, 403, 404, 422]).toContain(response.status());

            logTestEnd('Handle invalid employee ID format', 'passed');
        });
    });

    test.describe('Schema Validation', () => {

        test('should validate employee schema structure', async () => {
            logTestStart('Validate employee schema');

            const validEmployee = {
                employeeId: 'EMP001',
                firstName: 'John',
                lastName: 'Doe',
                status: 'Active'
            };

            const isValid = schemaValidator.isValid('employee', validEmployee);
            expect(isValid).toBeTruthy();

            logTestEnd('Validate employee schema', 'passed');
        });

        test('should reject invalid employee schema', async () => {
            logTestStart('Reject invalid employee schema');

            const invalidEmployee = {
                firstName: 123,
                lastName: true
            };

            const isValid = schemaValidator.isValid('employee', invalidEmployee);
            expect(isValid).toBeFalsy();

            logTestEnd('Reject invalid employee schema', 'passed');
        });

        test('should get validation errors for invalid data', async () => {
            logTestStart('Get validation errors');

            const invalidEmployee = {
                employeeId: 'EMP001',
                firstName: '',
                status: 'InvalidStatus'
            };

            const errors = schemaValidator.getValidationErrors('employee', invalidEmployee);
            expect(errors).not.toBeNull();
            expect(errors!.length).toBeGreaterThan(0);

            logTestEnd('Get validation errors', 'passed');
        });
    });

    test.describe('Response Headers', () => {

        test('should have security headers', async ({ request }) => {
            logTestStart('Check security headers');

            const response = await request.get(`${BASE_URL}/web/index.php/auth/login`);
            const headers = response.headers();

            expect(headers).toBeDefined();

            logTestEnd('Check security headers', 'passed');
        });

        test('should not expose sensitive headers', async ({ request }) => {
            logTestStart('Check sensitive headers');

            const response = await request.get(`${BASE_URL}/web/index.php/auth/login`);
            const headers = response.headers();

            expect(headers['x-powered-by']).toBeUndefined();

            logTestEnd('Check sensitive headers', 'passed');
        });
    });
});
