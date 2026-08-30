/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PARALLEL ISOLATION TESTS - Test Isolation Patterns
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Demonstrate parallel test execution and isolation strategies.
 * WHY: Fast execution without test interference.
 * IF NOT USED: Tests affect each other, flaky results, slow suite.
 * INTERVIEW TIP: "Playwright runs tests in isolated browser contexts by default"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages';
import { logTestStart, logTestEnd } from '../../src/helpers';

test.describe.serial('Serial Test Execution @serial', () => {
    test('Step 1: First test runs first', async ({ page }) => {
        logTestStart('Serial - Step 1');
        await page.goto('https://example.com');
        logTestEnd('Serial - Step 1', 'passed');
    });

    test('Step 2: Second test runs second', async ({ page }) => {
        logTestStart('Serial - Step 2');
        await page.goto('https://example.com');
        logTestEnd('Serial - Step 2', 'passed');
    });
});

test.describe.parallel('Parallel Test Execution @parallel', () => {
    test('Parallel test A', async ({ page }) => {
        logTestStart('Parallel - Test A');
        const loginPage = new LoginPage(page);
        await loginPage.navigate();
        await expect(page).toHaveTitle(/OrangeHRM/);
        logTestEnd('Parallel - Test A', 'passed');
    });

    test('Parallel test B', async ({ page }) => {
        logTestStart('Parallel - Test B');
        const loginPage = new LoginPage(page);
        await loginPage.navigate();
        await expect(page).toHaveTitle(/OrangeHRM/);
        logTestEnd('Parallel - Test B', 'passed');
    });
});

test.describe('Configured Parallelism @configured', () => {
    test.describe.configure({ mode: 'parallel' });

    test('Config test 1', async ({ page }) => {
        logTestStart('Configured - Test 1');
        await page.goto('https://example.com');
        logTestEnd('Configured - Test 1', 'passed');
    });

    test('Config test 2', async ({ page }) => {
        logTestStart('Configured - Test 2');
        await page.goto('https://example.com');
        logTestEnd('Configured - Test 2', 'passed');
    });
});

test.describe('Sharding Compatible Tests @sharding', () => {
    test('Shard-safe test 1', async ({ page }) => {
        logTestStart('Sharding - Test 1');
        await page.goto('https://example.com');
        logTestEnd('Sharding - Test 1', 'passed');
    });

    test('Shard-safe test 2', async ({ page }) => {
        logTestStart('Sharding - Test 2');
        await page.goto('https://example.com');
        logTestEnd('Sharding - Test 2', 'passed');
    });
});
