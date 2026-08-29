/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GLOBAL SETUP - Authentication Storage State
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Runs once before all tests to set up authentication.
 * WHY: Login once, reuse auth state - 10x faster test suite.
 * IF NOT USED: Login in every test = slow, flaky, wasteful.
 * INTERVIEW TIP: "storageState persists cookies/localStorage between tests"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { chromium, FullConfig } from '@playwright/test';
import { existsSync, mkdirSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

async function globalSetup(_config: FullConfig): Promise<void> {
    const authDir = 'auth';
    if (!existsSync(authDir)) {
        mkdirSync(authDir, { recursive: true });
    }

    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    const baseURL = process.env.ORANGEHRM_URL || 'https://opensource-demo.orangehrmlive.com';
    const username = process.env.ORANGEHRM_USERNAME || 'Admin';
    const password = process.env.ORANGEHRM_PASSWORD || 'admin123';

    await page.goto(`${baseURL}/web/index.php/auth/login`);
    await page.waitForLoadState('networkidle');

    await page.locator('input[name="username"]').fill(username);
    await page.locator('input[name="password"]').fill(password);
    await page.locator('button[type="submit"]').click();

    await page.waitForURL('**/dashboard/**');

    await context.storageState({ path: `${authDir}/admin.json` });

    await browser.close();

    console.log('Global setup complete: Admin auth state saved');
}

export default globalSetup;
