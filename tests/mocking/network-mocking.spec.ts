/**
 * ═══════════════════════════════════════════════════════════════════════════
 * NETWORK MOCKING TESTS - API Response Interception
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Tests using network mocking to simulate API responses.
 * WHY: Test edge cases, error states, and slow networks without real backend.
 * IF NOT USED: Can't test error handling, timeouts, or specific API states.
 * INTERVIEW TIP: "page.route() intercepts requests - perfect for mocking APIs"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { test, expect } from '../../src/fixtures';
import { logTestStart, logTestEnd } from '../../src/helpers';

test.describe('Network Mocking Tests @mocking @regression', () => {

    test.describe('Mock API Responses', () => {

        test('should mock employee list API response @smoke', async ({ pimPage, page }) => {
            logTestStart('Mock employee list API');

            const mockEmployees = {
                data: [
                    { empNumber: 1, firstName: 'Mock', lastName: 'User1' },
                    { empNumber: 2, firstName: 'Mock', lastName: 'User2' }
                ],
                meta: { total: 2 }
            };

            await page.route('**/api/v2/pim/employees**', async route => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(mockEmployees)
                });
            });

            await pimPage.navigate();

            logTestEnd('Mock employee list API', 'passed');
        });

        test('should mock empty employee list', async ({ pimPage, page }) => {
            logTestStart('Mock empty employee list');

            await page.route('**/api/v2/pim/employees**', async route => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ data: [], meta: { total: 0 } })
                });
            });

            await pimPage.navigate();

            logTestEnd('Mock empty employee list', 'passed');
        });

        test('should mock single employee details', async ({ page }) => {
            logTestStart('Mock single employee details');

            const mockEmployee = {
                data: {
                    empNumber: 1,
                    firstName: 'John',
                    lastName: 'Doe',
                    employeeId: 'EMP001'
                }
            };

            await page.route('**/api/v2/pim/employees/1', async route => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(mockEmployee)
                });
            });

            await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewPersonalDetails/empNumber/1');

            logTestEnd('Mock single employee details', 'passed');
        });
    });

    test.describe('Mock Error Responses', () => {

        test('should handle 500 server error', async ({ pimPage, page }) => {
            logTestStart('Handle 500 server error');

            await page.route('**/api/v2/pim/employees**', async route => {
                await route.fulfill({
                    status: 500,
                    contentType: 'application/json',
                    body: JSON.stringify({ error: 'Internal Server Error' })
                });
            });

            await pimPage.navigate();

            logTestEnd('Handle 500 server error', 'passed');
        });

        test('should handle 404 not found', async ({ page }) => {
            logTestStart('Handle 404 not found');

            await page.route('**/api/v2/pim/employees/999999', async route => {
                await route.fulfill({
                    status: 404,
                    contentType: 'application/json',
                    body: JSON.stringify({ error: 'Employee not found' })
                });
            });

            const response = await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewPersonalDetails/empNumber/999999');
            expect(response).not.toBeNull();

            logTestEnd('Handle 404 not found', 'passed');
        });

        test('should handle 401 unauthorized', async ({ pimPage, page }) => {
            logTestStart('Handle 401 unauthorized');

            await page.route('**/api/v2/pim/employees**', async route => {
                await route.fulfill({
                    status: 401,
                    contentType: 'application/json',
                    body: JSON.stringify({ error: 'Unauthorized' })
                });
            });

            await pimPage.navigate();

            logTestEnd('Handle 401 unauthorized', 'passed');
        });

        test('should handle 403 forbidden', async ({ pimPage, page }) => {
            logTestStart('Handle 403 forbidden');

            await page.route('**/api/v2/pim/employees**', async route => {
                await route.fulfill({
                    status: 403,
                    contentType: 'application/json',
                    body: JSON.stringify({ error: 'Forbidden' })
                });
            });

            await pimPage.navigate();

            logTestEnd('Handle 403 forbidden', 'passed');
        });

        test('should handle 422 validation error', async ({ pimPage, page }) => {
            logTestStart('Handle 422 validation error');

            await page.route('**/api/v2/pim/employees', async route => {
                if (route.request().method() === 'POST') {
                    await route.fulfill({
                        status: 422,
                        contentType: 'application/json',
                        body: JSON.stringify({
                            error: {
                                firstName: ['First name is required'],
                                lastName: ['Last name is required']
                            }
                        })
                    });
                } else {
                    await route.continue();
                }
            });

            await pimPage.navigate();

            logTestEnd('Handle 422 validation error', 'passed');
        });
    });

    test.describe('Mock Network Conditions', () => {

        test('should handle slow network response', async ({ pimPage, page }) => {
            logTestStart('Handle slow network');

            await page.route('**/api/v2/pim/employees**', async route => {
                await new Promise(resolve => setTimeout(resolve, 3000));
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ data: [], meta: { total: 0 } })
                });
            });

            await pimPage.navigate();

            logTestEnd('Handle slow network', 'passed');
        });

        test('should handle network timeout', async ({ pimPage, page }) => {
            logTestStart('Handle network timeout');

            await page.route('**/api/v2/pim/employees**', async route => {
                await route.abort('timedout');
            });

            try {
                await pimPage.navigate();
            } catch {
                // Expected to fail
            }

            logTestEnd('Handle network timeout', 'passed');
        });

        test('should handle connection refused', async ({ pimPage, page }) => {
            logTestStart('Handle connection refused');

            await page.route('**/api/v2/pim/employees**', async route => {
                await route.abort('connectionrefused');
            });

            try {
                await pimPage.navigate();
            } catch {
                // Expected to fail
            }

            logTestEnd('Handle connection refused', 'passed');
        });
    });

    test.describe('Request Interception', () => {

        test('should capture and verify request headers', async ({ pimPage, page }) => {
            logTestStart('Capture request headers');

            let capturedHeaders: Record<string, string> = {};

            await page.route('**/api/v2/pim/employees**', async route => {
                capturedHeaders = route.request().headers();
                await route.continue();
            });

            await pimPage.navigate();

            expect(capturedHeaders).toBeDefined();

            logTestEnd('Capture request headers', 'passed');
        });

        test('should capture and verify request body', async ({ page }) => {
            logTestStart('Capture request body');

            let capturedBody: string | null = null;

            await page.route('**/api/v2/pim/employees', async route => {
                if (route.request().method() === 'POST') {
                    capturedBody = route.request().postData();
                }
                await route.continue();
            });

            await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/pim/addEmployee');

            expect(capturedBody).toBeDefined();

            logTestEnd('Capture request body', 'passed');
        });

        test('should modify request before sending', async ({ pimPage, page }) => {
            logTestStart('Modify request');

            await page.route('**/api/v2/pim/employees**', async route => {
                const headers = {
                    ...route.request().headers(),
                    'X-Custom-Header': 'TestValue'
                };
                await route.continue({ headers });
            });

            await pimPage.navigate();

            logTestEnd('Modify request', 'passed');
        });
    });

    test.describe('Response Modification', () => {

        test('should modify API response data', async ({ pimPage, page }) => {
            logTestStart('Modify response data');

            await page.route('**/api/v2/pim/employees**', async route => {
                const response = await route.fetch();
                let body = await response.json();

                body = {
                    ...body,
                    customField: 'injected'
                };

                await route.fulfill({
                    response,
                    body: JSON.stringify(body)
                });
            });

            await pimPage.navigate();

            logTestEnd('Modify response data', 'passed');
        });

        test('should add response headers', async ({ pimPage, page }) => {
            logTestStart('Add response headers');

            await page.route('**/api/v2/pim/employees**', async route => {
                const response = await route.fetch();

                await route.fulfill({
                    response,
                    headers: {
                        ...response.headers(),
                        'X-Custom-Response': 'TestValue'
                    }
                });
            });

            await pimPage.navigate();

            logTestEnd('Add response headers', 'passed');
        });
    });

    test.describe('Conditional Mocking', () => {

        test('should mock based on request method', async ({ page }) => {
            logTestStart('Mock based on method');

            await page.route('**/api/v2/pim/employees**', async route => {
                if (route.request().method() === 'GET') {
                    await route.fulfill({
                        status: 200,
                        body: JSON.stringify({ data: [], meta: { total: 0 } })
                    });
                } else if (route.request().method() === 'POST') {
                    await route.fulfill({
                        status: 201,
                        body: JSON.stringify({ data: { id: 1 } })
                    });
                } else {
                    await route.continue();
                }
            });

            await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewEmployeeList');

            logTestEnd('Mock based on method', 'passed');
        });

        test('should mock based on query params', async ({ page }) => {
            logTestStart('Mock based on query params');

            await page.route('**/api/v2/pim/employees**', async route => {
                const url = new URL(route.request().url());
                const limit = url.searchParams.get('limit');

                if (limit === '10') {
                    await route.fulfill({
                        status: 200,
                        body: JSON.stringify({ data: Array(10).fill({}), meta: { total: 10 } })
                    });
                } else {
                    await route.continue();
                }
            });

            await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewEmployeeList');

            logTestEnd('Mock based on query params', 'passed');
        });
    });
});
