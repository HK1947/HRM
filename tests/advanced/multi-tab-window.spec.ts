/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MULTI-TAB & WINDOW TESTS - Browser Context Handling
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Test scenarios involving multiple tabs, windows, and popups.
 * WHY: Many apps open links in new tabs or use popup windows.
 * IF NOT USED: Can't test multi-tab workflows like OAuth or payments.
 * INTERVIEW TIP: "Playwright handles new tabs/popups via page.waitForEvent('popup')"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { test, expect, Page } from '@playwright/test';
import { logTestStart, logTestEnd } from '../../src/helpers';

test.describe('Multiple Tabs & Windows @multi-tab @regression', () => {

    test.describe('New Tab Handling', () => {

        test('should handle link opening in new tab @smoke', async ({ page, context }) => {
            logTestStart('New tab handling');

            await page.goto('https://the-internet.herokuapp.com/windows');

            /**
             * INTERVIEW TIP: "waitForEvent('popup') captures new tabs/windows
             * before they fully load, giving you the Page object"
             */
            const [newPage] = await Promise.all([
                context.waitForEvent('page'),
                page.click('a[href="/windows/new"]')
            ]);

            // Wait for the new page to load
            await newPage.waitForLoadState();

            // Verify new tab content
            await expect(newPage).toHaveTitle(/New Window/);
            await expect(newPage.locator('h3')).toContainText('New Window');

            // Original page should still be accessible
            await expect(page).toHaveTitle(/The Internet/);

            // Close new tab
            await newPage.close();

            logTestEnd('New tab handling', 'passed');
        });

        test('should switch between tabs', async ({ page, context }) => {
            logTestStart('Tab switching');

            await page.goto('https://the-internet.herokuapp.com/windows');

            // Open new tab
            const [newPage] = await Promise.all([
                context.waitForEvent('page'),
                page.click('a[href="/windows/new"]')
            ]);
            await newPage.waitForLoadState();

            /**
             * INTERVIEW TIP: "All pages in a context share cookies/storage.
             * Use context.pages() to get all open tabs."
             */
            const allPages = context.pages();
            expect(allPages.length).toBe(2);

            // Switch back to first tab
            await page.bringToFront();
            await expect(page.locator('h3')).toContainText('Opening a new window');

            // Switch to second tab
            await newPage.bringToFront();
            await expect(newPage.locator('h3')).toContainText('New Window');

            await newPage.close();

            logTestEnd('Tab switching', 'passed');
        });

        test('should open multiple tabs and manage them', async ({ page, context }) => {
            logTestStart('Multiple tabs management');

            await page.goto('https://the-internet.herokuapp.com');

            /**
             * INTERVIEW TIP: "You can open tabs programmatically or by
             * intercepting clicks on target='_blank' links"
             */
            // Open multiple tabs programmatically
            const tab1 = await context.newPage();
            await tab1.goto('https://the-internet.herokuapp.com/login');

            const tab2 = await context.newPage();
            await tab2.goto('https://the-internet.herokuapp.com/dropdown');

            // Verify all tabs
            expect(context.pages().length).toBe(3);

            // Work with each tab
            await expect(tab1.locator('#login h2')).toContainText('Login');
            await expect(tab2.locator('#content h3')).toContainText('Dropdown');

            // Close tabs
            await tab1.close();
            await tab2.close();

            expect(context.pages().length).toBe(1);

            logTestEnd('Multiple tabs management', 'passed');
        });
    });

    test.describe('Popup Window Handling', () => {

        test('should handle popup windows', async ({ page }) => {
            logTestStart('Popup window handling');

            await page.goto('https://the-internet.herokuapp.com/windows');

            /**
             * INTERVIEW TIP: "page.waitForEvent('popup') works for both
             * target='_blank' and window.open() popups"
             */
            const popupPromise = page.waitForEvent('popup');
            await page.click('a[href="/windows/new"]');
            const popup = await popupPromise;

            await popup.waitForLoadState();

            // Interact with popup
            await expect(popup).toHaveTitle(/New Window/);

            // Close popup
            await popup.close();

            logTestEnd('Popup window handling', 'passed');
        });

        test('should handle popup opened via JavaScript', async ({ page }) => {
            logTestStart('JavaScript popup');

            await page.goto('https://the-internet.herokuapp.com');

            /**
             * INTERVIEW TIP: "For window.open() popups, use the same
             * waitForEvent('popup') pattern"
             */
            // Simulate JavaScript popup
            const popupPromise = page.waitForEvent('popup');
            await page.evaluate(() => {
                window.open('https://the-internet.herokuapp.com/windows/new', '_blank');
            });
            const popup = await popupPromise;

            await popup.waitForLoadState();
            await expect(popup.locator('body')).toBeVisible();

            await popup.close();

            logTestEnd('JavaScript popup', 'passed');
        });
    });

    test.describe('Cross-Tab Communication', () => {

        test('should share cookies between tabs', async ({ context }) => {
            logTestStart('Cookie sharing between tabs');

            const page1 = await context.newPage();
            const page2 = await context.newPage();

            /**
             * INTERVIEW TIP: "Pages in the same context share cookies,
             * localStorage, and session storage"
             */
            // Set cookie in first tab
            await page1.goto('https://the-internet.herokuapp.com');
            await context.addCookies([{
                name: 'test_cookie',
                value: 'shared_value',
                url: 'https://the-internet.herokuapp.com'
            }]);

            // Verify cookie in second tab
            await page2.goto('https://the-internet.herokuapp.com');
            const cookies = await context.cookies();
            const testCookie = cookies.find(c => c.name === 'test_cookie');

            expect(testCookie?.value).toBe('shared_value');

            await page1.close();
            await page2.close();

            logTestEnd('Cookie sharing between tabs', 'passed');
        });

        test('should share localStorage between tabs', async ({ context }) => {
            logTestStart('localStorage sharing');

            const page1 = await context.newPage();
            await page1.goto('https://the-internet.herokuapp.com');

            /**
             * INTERVIEW TIP: "localStorage is shared between pages
             * from the same origin within the same context"
             */
            await page1.evaluate(() => {
                localStorage.setItem('shared_data', 'from_tab_1');
            });

            const page2 = await context.newPage();
            await page2.goto('https://the-internet.herokuapp.com');

            const storedValue = await page2.evaluate(() => {
                return localStorage.getItem('shared_data');
            });

            expect(storedValue).toBe('from_tab_1');

            await page1.close();
            await page2.close();

            logTestEnd('localStorage sharing', 'passed');
        });
    });

    test.describe('Isolated Contexts', () => {

        test('should create isolated browser context', async ({ browser }) => {
            logTestStart('Isolated context');

            /**
             * INTERVIEW TIP: "Use separate contexts for isolation -
             * each context has its own cookies, storage, and cache"
             */
            const context1 = await browser.newContext();
            const context2 = await browser.newContext();

            // Open pages (contexts need at least one page for cookies to work)
            await context1.newPage();
            await context2.newPage();

            // Set different cookies in each context
            await context1.addCookies([{
                name: 'user',
                value: 'user1',
                url: 'https://example.com'
            }]);

            await context2.addCookies([{
                name: 'user',
                value: 'user2',
                url: 'https://example.com'
            }]);

            // Verify isolation
            const cookies1 = await context1.cookies();
            const cookies2 = await context2.cookies();

            expect(cookies1.find(c => c.name === 'user')?.value).toBe('user1');
            expect(cookies2.find(c => c.name === 'user')?.value).toBe('user2');

            await context1.close();
            await context2.close();

            logTestEnd('Isolated context', 'passed');
        });

        test('should simulate multiple users', async ({ browser }) => {
            logTestStart('Multiple users simulation');

            /**
             * INTERVIEW TIP: "Use separate contexts to simulate multiple
             * users interacting with the app simultaneously"
             */
            const adminContext = await browser.newContext();
            const userContext = await browser.newContext();

            const adminPage = await adminContext.newPage();
            const userPage = await userContext.newPage();

            // Both users navigate to the same page
            await adminPage.goto('https://the-internet.herokuapp.com/login');
            await userPage.goto('https://the-internet.herokuapp.com/login');

            // Each has independent session
            await expect(adminPage.locator('#login')).toBeVisible();
            await expect(userPage.locator('#login')).toBeVisible();

            await adminContext.close();
            await userContext.close();

            logTestEnd('Multiple users simulation', 'passed');
        });
    });

    test.describe('Tab Close and Cleanup', () => {

        test('should handle unexpected tab close', async ({ page, context }) => {
            logTestStart('Unexpected tab close');

            await page.goto('https://the-internet.herokuapp.com/windows');

            const [newPage] = await Promise.all([
                context.waitForEvent('page'),
                page.click('a[href="/windows/new"]')
            ]);
            await newPage.waitForLoadState();

            /**
             * INTERVIEW TIP: "Listen for 'close' event to handle
             * unexpected tab/window closures"
             */
            let tabClosed = false;
            newPage.on('close', () => {
                tabClosed = true;
            });

            // Close the tab
            await newPage.close();

            expect(tabClosed).toBeTruthy();

            logTestEnd('Unexpected tab close', 'passed');
        });

        test('should cleanup all tabs on test end', async ({ context }) => {
            logTestStart('Tab cleanup');

            // Open several tabs
            const pages: Page[] = [];
            for (let i = 0; i < 3; i++) {
                const page = await context.newPage();
                await page.goto('https://example.com');
                pages.push(page);
            }

            /**
             * INTERVIEW TIP: "Always clean up tabs in afterEach/afterAll
             * to prevent resource leaks"
             */
            expect(context.pages().length).toBe(3);

            // Clean up
            for (const page of pages) {
                await page.close();
            }

            expect(context.pages().length).toBe(0);

            logTestEnd('Tab cleanup', 'passed');
        });
    });
});
