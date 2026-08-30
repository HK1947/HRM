/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ENVIRONMENT CONFIG - Multi-Environment Support
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Centralized environment configuration management.
 * WHY: Switch between dev/staging/prod without code changes.
 * IF NOT USED: Hardcoded URLs, can't test multiple environments.
 * INTERVIEW TIP: "Environment config enables testing across deployment stages"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { config } from 'dotenv';
import { resolve } from 'path';

export type Environment = 'dev' | 'staging' | 'prod';

export interface EnvironmentConfig {
    env: Environment;
    baseURL: string;
    apiBaseURL: string;
    adminUsername: string;
    adminPassword: string;
    timeout: number;
    retryCount: number;
    workers: number;
    headless: boolean;
    logLevel: string;
    screenshotOnFailure: boolean;
    videoOnFailure: boolean;
    traceOnFailure: boolean;
    enableVisualTests: boolean;
    enableA11yTests: boolean;
    enablePerformanceTests: boolean;
}

function loadEnvironment(): Environment {
    const env = process.env.ENV || process.env.NODE_ENV || 'dev';
    if (!['dev', 'staging', 'prod'].includes(env)) {
        console.warn(`Unknown environment "${env}", defaulting to "dev"`);
        return 'dev';
    }
    return env as Environment;
}

function loadEnvFile(env: Environment): void {
    const envFile = `.env.${env}`;
    const envPath = resolve(process.cwd(), envFile);

    config({ path: envPath });

    // Also load base .env for overrides
    config({ path: resolve(process.cwd(), '.env'), override: false });
}

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === 'true';
}

function parseNumber(value: string | undefined, defaultValue: number): number {
    if (value === undefined) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
}

export function getEnvironmentConfig(): EnvironmentConfig {
    const env = loadEnvironment();
    loadEnvFile(env);

    return {
        env,
        baseURL: process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com',
        apiBaseURL: process.env.API_BASE_URL || 'https://opensource-demo.orangehrmlive.com/web/index.php/api/v2',
        adminUsername: process.env.ADMIN_USERNAME || 'Admin',
        adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
        timeout: parseNumber(process.env.TIMEOUT, 30000),
        retryCount: parseNumber(process.env.RETRY_COUNT, 1),
        workers: parseNumber(process.env.WORKERS, 4),
        headless: parseBoolean(process.env.HEADLESS, true),
        logLevel: process.env.LOG_LEVEL || 'info',
        screenshotOnFailure: parseBoolean(process.env.SCREENSHOT_ON_FAILURE, true),
        videoOnFailure: parseBoolean(process.env.VIDEO_ON_FAILURE, true),
        traceOnFailure: parseBoolean(process.env.TRACE_ON_FAILURE, true),
        enableVisualTests: parseBoolean(process.env.ENABLE_VISUAL_TESTS, true),
        enableA11yTests: parseBoolean(process.env.ENABLE_A11Y_TESTS, true),
        enablePerformanceTests: parseBoolean(process.env.ENABLE_PERFORMANCE_TESTS, true),
    };
}

// Singleton instance
export const envConfig = getEnvironmentConfig();

// Export helper function for test annotations
export function skipIfDisabled(feature: 'visual' | 'a11y' | 'performance'): boolean {
    const config = getEnvironmentConfig();
    switch (feature) {
        case 'visual': return !config.enableVisualTests;
        case 'a11y': return !config.enableA11yTests;
        case 'performance': return !config.enablePerformanceTests;
        default: return false;
    }
}
