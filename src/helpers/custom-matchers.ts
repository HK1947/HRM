/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CUSTOM MATCHERS - Extended Playwright Assertions
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Custom assertions extending Playwright's expect.
 * WHY: Domain-specific assertions make tests more readable.
 * IF NOT USED: Verbose, repeated assertion logic in tests.
 * INTERVIEW TIP: "Custom matchers encapsulate complex assertions into readable names"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { expect, Locator, Page } from '@playwright/test';

/**
 * Custom matchers for Playwright
 *
 * INTERVIEW TIP: "We extend expect() with domain-specific matchers
 * so tests read like specifications: expect(form).toBeValid()"
 */
export const customMatchers = {
    /**
     * Assert element has specific CSS property value
     *
     * @example
     * await expectCssProperty(button, 'background-color', 'rgb(255, 0, 0)');
     */
    async toHaveCssProperty(
        locator: Locator,
        property: string,
        expectedValue: string
    ): Promise<void> {
        const actualValue = await locator.evaluate(
            (el, prop) => getComputedStyle(el).getPropertyValue(prop),
            property
        );
        expect(actualValue.trim()).toBe(expectedValue);
    },

    /**
     * Assert element is within viewport
     *
     * @example
     * await expectInViewport(header);
     */
    async toBeInViewport(locator: Locator): Promise<void> {
        const isVisible = await locator.evaluate(el => {
            const rect = el.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= window.innerHeight &&
                rect.right <= window.innerWidth
            );
        });
        expect(isVisible).toBeTruthy();
    },

    /**
     * Assert form field is valid
     *
     * @example
     * await expectFieldValid(emailInput);
     */
    async toBeValidField(locator: Locator): Promise<void> {
        const isValid = await locator.evaluate(
            (el) => (el as HTMLInputElement).checkValidity()
        );
        expect(isValid).toBeTruthy();
    },

    /**
     * Assert element has focus
     *
     * @example
     * await expectFocused(searchInput);
     */
    async toBeFocused(locator: Locator): Promise<void> {
        const isFocused = await locator.evaluate(
            el => document.activeElement === el
        );
        expect(isFocused).toBeTruthy();
    },

    /**
     * Assert element scroll position
     */
    async toHaveScrollPosition(
        locator: Locator,
        expectedScrollTop: number,
        tolerance = 5
    ): Promise<void> {
        const scrollTop = await locator.evaluate(el => el.scrollTop);
        expect(Math.abs(scrollTop - expectedScrollTop)).toBeLessThanOrEqual(tolerance);
    },

    /**
     * Assert page has no console errors
     *
     * INTERVIEW TIP: "We check for JS errors to catch runtime issues
     * that don't cause visible failures"
     */
    async toHaveNoConsoleErrors(page: Page): Promise<void> {
        const errors: string[] = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });
        await page.waitForTimeout(100); // Allow time for errors to appear
        expect(errors).toHaveLength(0);
    },

    /**
     * Assert API response time is acceptable
     *
     * @example
     * await expectResponseTime(response, 2000);
     */
    async toRespondWithin(
        responsePromise: Promise<{ timing: () => { responseEnd: number; requestStart: number } }>,
        maxMs: number
    ): Promise<void> {
        const response = await responsePromise;
        const timing = response.timing();
        const duration = timing.responseEnd - timing.requestStart;
        expect(duration).toBeLessThan(maxMs);
    },
};

/**
 * Soft assertion wrapper - continues test on failure
 *
 * INTERVIEW TIP: "Soft assertions collect all failures instead of
 * stopping at the first one, useful for form validation tests"
 *
 * @example
 * const soft = createSoftAssert();
 * soft.expect(await page.title()).toBe('Home');
 * soft.expect(await btn.isVisible()).toBe(true);
 * await soft.assertAll(); // Throws if any failed
 */
export class SoftAssert {
    private errors: Error[] = [];

    expect<T>(actual: T): SoftExpect<T> {
        return new SoftExpect(actual, this.errors);
    }

    async expectLocator(locator: Locator): Promise<SoftLocatorExpect> {
        return new SoftLocatorExpect(locator, this.errors);
    }

    assertAll(): void {
        if (this.errors.length > 0) {
            const message = this.errors
                .map((e, i) => `${i + 1}. ${e.message}`)
                .join('\n');
            throw new Error(`Soft assertion failures:\n${message}`);
        }
    }

    getErrors(): Error[] {
        return [...this.errors];
    }

    clear(): void {
        this.errors = [];
    }
}

class SoftExpect<T> {
    constructor(private actual: T, private errors: Error[]) {}

    toBe(expected: T): void {
        try {
            expect(this.actual).toBe(expected);
        } catch (error) {
            this.errors.push(error as Error);
        }
    }

    toEqual(expected: T): void {
        try {
            expect(this.actual as unknown).toEqual(expected);
        } catch (error) {
            this.errors.push(error as Error);
        }
    }

    toBeTruthy(): void {
        try {
            expect(this.actual as unknown).toBeTruthy();
        } catch (error) {
            this.errors.push(error as Error);
        }
    }

    toBeFalsy(): void {
        try {
            expect(this.actual as unknown).toBeFalsy();
        } catch (error) {
            this.errors.push(error as Error);
        }
    }

    toContain(expected: unknown): void {
        try {
            expect(this.actual as unknown[]).toContain(expected);
        } catch (error) {
            this.errors.push(error as Error);
        }
    }

    toBeGreaterThan(expected: number): void {
        try {
            expect(this.actual as number).toBeGreaterThan(expected);
        } catch (error) {
            this.errors.push(error as Error);
        }
    }

    toBeLessThan(expected: number): void {
        try {
            expect(this.actual as number).toBeLessThan(expected);
        } catch (error) {
            this.errors.push(error as Error);
        }
    }

    toMatch(expected: RegExp | string): void {
        try {
            expect(this.actual as string).toMatch(expected);
        } catch (error) {
            this.errors.push(error as Error);
        }
    }
}

class SoftLocatorExpect {
    constructor(private locator: Locator, private errors: Error[]) {}

    async toBeVisible(): Promise<void> {
        try {
            await expect(this.locator).toBeVisible();
        } catch (error) {
            this.errors.push(error as Error);
        }
    }

    async toBeHidden(): Promise<void> {
        try {
            await expect(this.locator).toBeHidden();
        } catch (error) {
            this.errors.push(error as Error);
        }
    }

    async toHaveText(expected: string | RegExp): Promise<void> {
        try {
            await expect(this.locator).toHaveText(expected);
        } catch (error) {
            this.errors.push(error as Error);
        }
    }

    async toHaveValue(expected: string | RegExp): Promise<void> {
        try {
            await expect(this.locator).toHaveValue(expected);
        } catch (error) {
            this.errors.push(error as Error);
        }
    }

    async toBeEnabled(): Promise<void> {
        try {
            await expect(this.locator).toBeEnabled();
        } catch (error) {
            this.errors.push(error as Error);
        }
    }

    async toBeDisabled(): Promise<void> {
        try {
            await expect(this.locator).toBeDisabled();
        } catch (error) {
            this.errors.push(error as Error);
        }
    }
}

/**
 * Factory function to create soft assert instance
 */
export function createSoftAssert(): SoftAssert {
    return new SoftAssert();
}

/**
 * Wait for condition with custom message
 *
 * INTERVIEW TIP: "Custom wait conditions are more readable than
 * generic waitFor with complex predicates"
 */
export async function waitForCondition(
    condition: () => Promise<boolean>,
    message: string,
    timeout = 10000,
    interval = 100
): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        if (await condition()) {
            return;
        }
        await new Promise(resolve => setTimeout(resolve, interval));
    }

    throw new Error(`Timeout waiting for condition: ${message}`);
}
