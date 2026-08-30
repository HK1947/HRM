/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ALLURE STEPS - Rich Reporting Annotations
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Decorators and helpers for Allure step annotations.
 * WHY: Beautiful, detailed test reports with step-by-step execution.
 * IF NOT USED: Flat reports without clear step breakdown.
 * INTERVIEW TIP: "Allure steps show exactly what each test does"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { test } from '@playwright/test';

/**
 * Step decorator for methods
 *
 * INTERVIEW TIP: "Allure steps create hierarchical reports -
 * you can see exactly which step failed and why"
 *
 * Usage:
 * @step('Login as {username}')
 * async login(username: string, password: string) { ... }
 */
export function step(stepName: string) {
    return function decorator(
        target: object,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: unknown[]) {
            // Replace placeholders in step name with actual values
            let resolvedName = stepName;
            const paramNames = getParamNames(originalMethod);

            paramNames.forEach((name, index) => {
                if (args[index] !== undefined) {
                    resolvedName = resolvedName.replace(`{${name}}`, String(args[index]));
                }
            });

            return await test.step(resolvedName, async () => {
                return await originalMethod.apply(this, args);
            });
        };

        return descriptor;
    };
}

/**
 * Wrap async function in a step
 *
 * Usage:
 * await wrapStep('Navigate to login page', async () => {
 *     await page.goto('/login');
 * });
 */
export async function wrapStep<T>(name: string, fn: () => Promise<T>): Promise<T> {
    return await test.step(name, fn);
}

/**
 * Attach data to Allure report
 *
 * INTERVIEW TIP: "Attachments help debug - attach API responses,
 * screenshots, or any relevant data to failed tests"
 */
export async function attachToReport(
    name: string,
    content: string | Buffer,
    contentType: 'text/plain' | 'application/json' | 'image/png' | 'text/html' = 'text/plain'
): Promise<void> {
    await test.info().attach(name, {
        body: typeof content === 'string' ? Buffer.from(content) : content,
        contentType,
    });
}

/**
 * Attach JSON data to report
 */
export async function attachJSON(name: string, data: unknown): Promise<void> {
    await attachToReport(name, JSON.stringify(data, null, 2), 'application/json');
}

/**
 * Attach screenshot to report
 */
export async function attachScreenshot(name: string, screenshot: Buffer): Promise<void> {
    await attachToReport(name, screenshot, 'image/png');
}

/**
 * Add annotation to test
 *
 * INTERVIEW TIP: "Annotations categorize tests in Allure -
 * filter by feature, story, severity in the report"
 */
export function addAnnotation(type: string, description: string): void {
    test.info().annotations.push({ type, description });
}

/**
 * Common Allure annotations
 */
export const allure = {
    feature: (name: string) => addAnnotation('feature', name),
    story: (name: string) => addAnnotation('story', name),
    severity: (level: 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial') =>
        addAnnotation('severity', level),
    owner: (name: string) => addAnnotation('owner', name),
    tag: (name: string) => addAnnotation('tag', name),
    link: (url: string, name?: string) => addAnnotation('link', name ? `${name}:${url}` : url),
    issue: (id: string) => addAnnotation('issue', id),
    tms: (id: string) => addAnnotation('tms', id),
};

/**
 * Precondition step - for test setup
 *
 * Usage:
 * await precondition('User is logged in', async () => {
 *     await loginPage.login(credentials);
 * });
 */
export async function precondition<T>(description: string, fn: () => Promise<T>): Promise<T> {
    return await test.step(`[Precondition] ${description}`, fn);
}

/**
 * Action step - for test actions
 *
 * Usage:
 * await action('Click submit button', async () => {
 *     await page.click('#submit');
 * });
 */
export async function action<T>(description: string, fn: () => Promise<T>): Promise<T> {
    return await test.step(`[Action] ${description}`, fn);
}

/**
 * Verification step - for assertions
 *
 * Usage:
 * await verify('Success message is displayed', async () => {
 *     await expect(page.locator('.success')).toBeVisible();
 * });
 */
export async function verify<T>(description: string, fn: () => Promise<T>): Promise<T> {
    return await test.step(`[Verify] ${description}`, fn);
}

/**
 * Cleanup step - for test teardown
 */
export async function cleanup<T>(description: string, fn: () => Promise<T>): Promise<T> {
    return await test.step(`[Cleanup] ${description}`, fn);
}

/**
 * Helper to extract parameter names from function
 */
function getParamNames(fn: (...args: unknown[]) => unknown): string[] {
    const fnStr = fn.toString();
    const result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')'));
    return result.split(',').map((param) => param.trim().split(/[=:]/)[0].trim()).filter(Boolean);
}

/**
 * Test categorization helpers for BDD-style reporting
 *
 * INTERVIEW TIP: "These helpers map to Allure's epic/feature/story hierarchy"
 */
export const testCategory = {
    epic: (name: string) => {
        addAnnotation('epic', name);
        return { feature: testCategory.feature };
    },
    feature: (name: string) => {
        addAnnotation('feature', name);
        return { story: testCategory.story };
    },
    story: (name: string) => {
        addAnnotation('story', name);
    },
};

/**
 * Example usage in tests:
 *
 * test('should login successfully', async ({ page }) => {
 *     // Add categorization
 *     allure.feature('Authentication');
 *     allure.story('Login');
 *     allure.severity('critical');
 *     allure.owner('qa-team');
 *
 *     // Use step wrappers
 *     await precondition('Navigate to login page', async () => {
 *         await page.goto('/login');
 *     });
 *
 *     await action('Enter credentials', async () => {
 *         await page.fill('#username', 'Admin');
 *         await page.fill('#password', 'admin123');
 *     });
 *
 *     await action('Click login button', async () => {
 *         await page.click('#login');
 *     });
 *
 *     await verify('Dashboard is displayed', async () => {
 *         await expect(page).toHaveURL(/dashboard/);
 *     });
 *
 *     // Attach evidence
 *     await attachJSON('User Data', { username: 'Admin', role: 'admin' });
 * });
 */
