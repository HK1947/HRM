/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PLAYWRIGHT CONFIG - Enterprise Configuration (v2.0)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Central Playwright configuration with projects, sharding, and reporters.
 * WHY: Control test execution, parallelism, retries, and reporting.
 * IF NOT USED: Default config lacks enterprise features.
 * INTERVIEW TIP: "Projects allow different configs per test type (UI vs API vs Mobile)"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { defineConfig, devices } from '@playwright/test';
import { getEnvironmentConfig } from './src/config/environment';

const envConfig = getEnvironmentConfig();

export default defineConfig({
    /**
     * Test directory and file matching
     */
    testDir: './tests',
    testMatch: '**/*.spec.ts',

    /**
     * Parallel execution settings
     *
     * INTERVIEW TIP: "fullyParallel runs test files in parallel AND tests
     * within files in parallel - maximum speed"
     */
    fullyParallel: true,
    workers: process.env.CI ? 4 : envConfig.workers,

    /**
     * Fail CI on test.only() to prevent accidental commits
     */
    forbidOnly: !!process.env.CI,

    /**
     * Retry configuration
     *
     * INTERVIEW TIP: "Retries help with flaky tests, but investigate root causes.
     * 2 retries in CI, 0 locally to catch flaky tests early."
     */
    retries: process.env.CI ? envConfig.retryCount : 0,

    /**
     * Reporter configuration
     *
     * INTERVIEW TIP: "Multiple reporters can run simultaneously -
     * HTML for humans, JSON for dashboards, JUnit for CI"
     */
    /**
     * INTERVIEW TIP: "Multiple reporters run in parallel -
     * HTML for local dev, Allure for dashboards, JUnit for CI integration"
     */
    reporter: [
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['json', { outputFile: 'results/results.json' }],
        ['junit', { outputFile: 'results/junit.xml' }],
        ['list'],
        // Custom reporter for enhanced console output
        ['./src/reporters/custom-reporter.ts'],
        // Allure for rich visual reports with step annotations
        ['allure-playwright', { outputFolder: 'allure-results' }],
    ],

    /**
     * Global setup - runs once before all tests
     */
    globalSetup: './global-setup.ts',

    /**
     * Global timeout settings
     */
    timeout: envConfig.timeout,
    expect: {
        timeout: 10000,
        toHaveScreenshot: {
            maxDiffPixels: 100,
            threshold: 0.2,
        },
        toMatchSnapshot: {
            maxDiffPixelRatio: 0.1,
        },
    },

    /**
     * Shared settings for all projects
     *
     * INTERVIEW TIP: "use block sets defaults, individual projects can override"
     */
    use: {
        baseURL: envConfig.baseURL,

        // Tracing, screenshots, and video
        trace: envConfig.traceOnFailure ? 'on-first-retry' : 'off',
        screenshot: envConfig.screenshotOnFailure ? 'only-on-failure' : 'off',
        video: envConfig.videoOnFailure ? 'retain-on-failure' : 'off',

        // Timeouts
        actionTimeout: 15000,
        navigationTimeout: 30000,

        // Browser options
        headless: envConfig.headless,
        viewport: { width: 1280, height: 720 },

        // Network options
        ignoreHTTPSErrors: true,

        // Locale and timezone (can be overridden in tests)
        locale: 'en-US',
        timezoneId: 'America/New_York',
    },

    /**
     * Project configurations
     *
     * INTERVIEW TIP: "Projects let you run same tests across different
     * browsers, devices, and configurations"
     */
    projects: [
        /**
         * Setup project - runs before main tests
         */
        {
            name: 'setup',
            testMatch: /global-setup\.ts/,
            teardown: 'cleanup',
        },
        {
            name: 'cleanup',
            testMatch: /global-teardown\.ts/,
        },

        /**
         * Desktop browser - Chromium only for default runs
         * INTERVIEW TIP: "Run on one browser locally, cross-browser in CI"
         */
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                storageState: 'auth/admin.json',
            },
            dependencies: ['setup'],
        },

        /**
         * Cross-browser testing - uncomment for CI or manual cross-browser runs
         * Run with: npx playwright test --project=firefox --project=webkit
         */
        // {
        //     name: 'firefox',
        //     use: {
        //         ...devices['Desktop Firefox'],
        //         storageState: 'auth/admin.json',
        //     },
        //     dependencies: ['setup'],
        // },
        // {
        //     name: 'webkit',
        //     use: {
        //         ...devices['Desktop Safari'],
        //         storageState: 'auth/admin.json',
        //     },
        //     dependencies: ['setup'],
        // },

        /**
         * Mobile emulation - uncomment for responsive testing
         * Run with: npx playwright test --project=mobile-chrome
         *
         * INTERVIEW TIP: "Mobile projects emulate viewport, user agent,
         * and touch events - not actual mobile browsers"
         */
        // {
        //     name: 'mobile-chrome',
        //     use: {
        //         ...devices['Pixel 5'],
        //         storageState: 'auth/admin.json',
        //     },
        //     dependencies: ['setup'],
        // },
        // {
        //     name: 'mobile-safari',
        //     use: {
        //         ...devices['iPhone 12'],
        //         storageState: 'auth/admin.json',
        //     },
        //     dependencies: ['setup'],
        // },
        // {
        //     name: 'tablet',
        //     use: {
        //         ...devices['iPad Pro 11'],
        //         storageState: 'auth/admin.json',
        //     },
        //     dependencies: ['setup'],
        // },

        /**
         * API-only tests (no browser needed)
         *
         * INTERVIEW TIP: "API projects are faster - no browser overhead"
         */
        {
            name: 'api',
            testMatch: /.*\.api\.spec\.ts/,
            use: {
                baseURL: envConfig.apiBaseURL,
            },
        },

        /**
         * Accessibility tests
         */
        {
            name: 'accessibility',
            testDir: './tests/accessibility',
            use: {
                ...devices['Desktop Chrome'],
                storageState: 'auth/admin.json',
            },
            dependencies: ['setup'],
        },

        /**
         * Performance tests
         */
        {
            name: 'performance',
            testDir: './tests/performance',
            use: {
                ...devices['Desktop Chrome'],
                // No storage state - test login performance too
            },
        },

        /**
         * Visual regression tests
         */
        {
            name: 'visual',
            testDir: './tests/visual',
            use: {
                ...devices['Desktop Chrome'],
                storageState: 'auth/admin.json',
            },
            dependencies: ['setup'],
        },
    ],

    /**
     * Output directory for test artifacts
     */
    outputDir: 'test-results',

    /**
     * Web server configuration (if testing local app)
     *
     * INTERVIEW TIP: "webServer starts your app before tests and stops after.
     * Uncomment if testing a local application."
     */
    // webServer: {
    //     command: 'npm run start',
    //     url: 'http://localhost:3000',
    //     reuseExistingServer: !process.env.CI,
    //     timeout: 120000,
    // },
});
