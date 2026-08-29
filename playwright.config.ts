/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PLAYWRIGHT CONFIG - Enterprise Configuration
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Central Playwright configuration with projects and sharding.
 * WHY: Control test execution, parallelism, reporters, retries.
 * IF NOT USED: Default config lacks enterprise features.
 * INTERVIEW TIP: "Projects allow different configs per test type (UI vs API)"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const baseURL = process.env.ORANGEHRM_URL || 'https://opensource-demo.orangehrmlive.com';

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 4 : undefined,

    reporter: [
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['json', { outputFile: 'results/results.json' }],
        ['junit', { outputFile: 'results/junit.xml' }],
        ['list']
    ],

    globalSetup: './global-setup.ts',

    use: {
        baseURL,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        actionTimeout: 15000,
        navigationTimeout: 30000
    },

    projects: [
        {
            name: 'setup',
            testMatch: /global-setup\.ts/,
            teardown: 'cleanup'
        },
        {
            name: 'cleanup',
            testMatch: /global-teardown\.ts/
        },
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                storageState: 'auth/admin.json'
            },
            dependencies: ['setup']
        },
        {
            name: 'firefox',
            use: {
                ...devices['Desktop Firefox'],
                storageState: 'auth/admin.json'
            },
            dependencies: ['setup']
        },
        {
            name: 'webkit',
            use: {
                ...devices['Desktop Safari'],
                storageState: 'auth/admin.json'
            },
            dependencies: ['setup']
        },
        {
            name: 'mobile-chrome',
            use: {
                ...devices['Pixel 5'],
                storageState: 'auth/admin.json'
            },
            dependencies: ['setup']
        },
        {
            name: 'api',
            testMatch: /.*\.api\.spec\.ts/,
            use: {
                baseURL
            }
        }
    ],

    expect: {
        timeout: 10000,
        toHaveScreenshot: {
            maxDiffPixels: 100
        }
    },

    outputDir: 'test-results'
});
