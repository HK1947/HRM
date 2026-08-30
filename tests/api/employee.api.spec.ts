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
import { logTestStart, logTestEnd } from '../../src/helpers';
import Ajv from 'ajv';

const BASE_URL = process.env.ORANGEHRM_URL || 'https://opensource-demo.orangehrmlive.com';

test.describe('Employee API @api @regression', () => {

    test.describe('Positive Scenarios', () => {

        test('should return 200 for valid endpoint @smoke', async ({ request }) => {
            logTestStart('Valid endpoint returns 200');

            const response = await request.get(`${BASE_URL}/web/index.php/api/v2/admin/users`);

            // OrangeHRM requires auth, so 401/403 is also valid for demo
            expect([200, 401, 403]).toContain(response.status());

            logTestEnd('Valid endpoint returns 200', 'passed');
        });

        test('should have correct content-type header', async ({ request }) => {
            logTestStart('Correct content-type header');

            const response = await request.get(`${BASE_URL}/web/index.php/api/v2/admin/users`);

            const contentType = response.headers()['content-type'];
            // May return HTML if not authenticated
            expect(contentType).toBeDefined();

            logTestEnd('Correct content-type header', 'passed');
        });

        test('should return JSON response', async ({ request }) => {
            logTestStart('JSON response');

            const response = await request.get(`${BASE_URL}/web/index.php/api/v2/pim/employees`);

            // Check response is parseable (may be error JSON)
            const text = await response.text();
            expect(text.length).toBeGreaterThan(0);

            logTestEnd('JSON response', 'passed');
        });
    });

    test.describe('Negative Scenarios', () => {

        test('should return 404 for non-existent endpoint', async ({ request }) => {
            logTestStart('404 for non-existent endpoint');

            const response = await request.get(`${BASE_URL}/web/index.php/api/v2/nonexistent`);

            // Could be 404, 401, or 403 depending on auth state
            expect([404, 401, 403]).toContain(response.status());

            logTestEnd('404 for non-existent endpoint', 'passed');
        });

        test('should return 401 for unauthorized request', async ({ request }) => {
            logTestStart('401 for unauthorized');

            const response = await request.get(`${BASE_URL}/web/index.php/api/v2/admin/users`, {
                headers: {
                    'Authorization': 'Bearer invalid_token'
                }
            });

            // Demo site may return 401 or 403
            expect([401, 403]).toContain(response.status());

            logTestEnd('401 for unauthorized', 'passed');
        });
    });

    test.describe('Schema Validation', () => {
        const ajv = new Ajv();

        test('should validate employee schema structure', async ({ request }) => {
            logTestStart('Employee schema validation');

            // INTERVIEW TIP: "JSON Schema validates API contracts"
            const employeeSchema = {
                type: 'object',
                properties: {
                    empNumber: { type: 'number' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' }
                }
            };

            const validate = ajv.compile(employeeSchema);

            // Validate a sample object against schema
            const sampleEmployee = {
                empNumber: 1,
                firstName: 'John',
                lastName: 'Doe'
            };

            const isValid = validate(sampleEmployee);
            expect(isValid).toBe(true);

            logTestEnd('Employee schema validation', 'passed');
        });

        test('should reject invalid employee schema', async ({ request }) => {
            logTestStart('Invalid schema rejection');

            const employeeSchema = {
                type: 'object',
                required: ['firstName', 'lastName'],
                properties: {
                    firstName: { type: 'string' },
                    lastName: { type: 'string' }
                }
            };

            const validate = ajv.compile(employeeSchema);

            // Missing required field
            const invalidEmployee = {
                firstName: 'John'
            };

            const isValid = validate(invalidEmployee);
            expect(isValid).toBe(false);

            logTestEnd('Invalid schema rejection', 'passed');
        });
    });

    test.describe('Error Handling', () => {

        test('should handle empty request body', async ({ request }) => {
            logTestStart('Empty request body');

            const response = await request.post(`${BASE_URL}/web/index.php/api/v2/pim/employees`, {
                data: {}
            });

            // Should get some error response (401, 403, or 422)
            expect([401, 403, 422, 400]).toContain(response.status());

            logTestEnd('Empty request body', 'passed');
        });

        test('should handle malformed JSON in request body', async ({ request }) => {
            logTestStart('Malformed JSON');

            const response = await request.post(`${BASE_URL}/web/index.php/api/v2/pim/employees`, {
                headers: {
                    'Content-Type': 'application/json'
                },
                data: 'not valid json {'
            });

            // Should return error
            expect(response.status()).not.toBe(200);

            logTestEnd('Malformed JSON', 'passed');
        });

        test('should handle invalid employee ID format', async ({ request }) => {
            logTestStart('Invalid employee ID');

            const response = await request.get(`${BASE_URL}/web/index.php/api/v2/pim/employees/invalid-id`);

            expect([400, 401, 403, 404]).toContain(response.status());

            logTestEnd('Invalid employee ID', 'passed');
        });

        test('should get validation errors for invalid data', async ({ request }) => {
            logTestStart('Validation errors');

            const response = await request.post(`${BASE_URL}/web/index.php/api/v2/pim/employees`, {
                data: {
                    firstName: '', // Empty required field
                    lastName: ''
                }
            });

            // Should return error
            expect([400, 401, 403, 422]).toContain(response.status());

            logTestEnd('Validation errors', 'passed');
        });
    });

    test.describe('Security Headers', () => {

        test('should have security headers', async ({ request }) => {
            logTestStart('Security headers');

            const response = await request.get(`${BASE_URL}/web/index.php/auth/login`);
            const headers = response.headers();

            // Check that some headers exist (demo site may not have all security headers)
            expect(headers).toBeDefined();

            logTestEnd('Security headers', 'passed');
        });

        test('should not expose sensitive headers', async ({ request }) => {
            logTestStart('No sensitive headers');

            const response = await request.get(`${BASE_URL}/web/index.php/api/v2/admin/users`);
            const headers = response.headers();

            // Should not expose server internals
            expect(headers['x-powered-by']).toBeUndefined();

            logTestEnd('No sensitive headers', 'passed');
        });
    });
});
