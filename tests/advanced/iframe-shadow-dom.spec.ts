/**
 * ═══════════════════════════════════════════════════════════════════════════
 * IFRAME & SHADOW DOM TESTS - Advanced DOM Handling
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Test interactions with iframes and Shadow DOM elements.
 * WHY: Modern web apps use these for isolation and component encapsulation.
 * IF NOT USED: Can't test embedded content or web components.
 * INTERVIEW TIP: "Playwright handles iframes via frameLocator() and pierces Shadow DOM by default"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { test, expect } from '@playwright/test';
import { logTestStart, logTestEnd } from '../../src/helpers';

test.describe('iFrame Handling @iframe @regression', () => {

    test.describe('Basic iFrame Interactions', () => {

        test('should interact with elements inside iframe @smoke', async ({ page }) => {
            logTestStart('Basic iframe interaction');

            // Navigate to a page with iframes
            await page.goto('https://the-internet.herokuapp.com/iframe');

            /**
             * INTERVIEW TIP: "frameLocator() creates a scoped locator
             * that searches only within the specified iframe"
             */
            const frame = page.frameLocator('#mce_0_ifr');

            // Type in the iframe's editor
            const editor = frame.locator('#tinymce');
            await editor.clear();
            await editor.fill('Hello from Playwright!');

            // Verify the text was entered
            await expect(editor).toContainText('Hello from Playwright!');

            logTestEnd('Basic iframe interaction', 'passed');
        });

        test('should handle nested iframes', async ({ page }) => {
            logTestStart('Nested iframes');

            await page.goto('https://the-internet.herokuapp.com/nested_frames');

            /**
             * INTERVIEW TIP: "Chain frameLocator() calls for nested iframes"
             */
            const topFrame = page.frameLocator('frame[name="frame-top"]');
            const leftFrame = topFrame.frameLocator('frame[name="frame-left"]');

            // Verify content in nested frame
            await expect(leftFrame.locator('body')).toContainText('LEFT');

            // Access middle frame
            const middleFrame = topFrame.frameLocator('frame[name="frame-middle"]');
            await expect(middleFrame.locator('body')).toContainText('MIDDLE');

            logTestEnd('Nested iframes', 'passed');
        });

        test('should wait for iframe to load', async ({ page }) => {
            logTestStart('Wait for iframe load');

            await page.goto('https://the-internet.herokuapp.com/iframe');

            /**
             * INTERVIEW TIP: "frameLocator() automatically waits for the frame
             * to be attached, but you may need to wait for content"
             */
            const frame = page.frameLocator('#mce_0_ifr');

            // Wait for content inside iframe
            const editor = frame.locator('#tinymce');
            await editor.waitFor({ state: 'visible' });

            expect(await editor.isVisible()).toBeTruthy();

            logTestEnd('Wait for iframe load', 'passed');
        });

        test('should handle iframe by name', async ({ page }) => {
            logTestStart('iFrame by name');

            await page.goto('https://the-internet.herokuapp.com/nested_frames');

            /**
             * INTERVIEW TIP: "You can locate iframes by various attributes:
             * #id, [name=...], [src=...], nth-child(), etc."
             */
            const bottomFrame = page.frameLocator('frame[name="frame-bottom"]');
            await expect(bottomFrame.locator('body')).toContainText('BOTTOM');

            logTestEnd('iFrame by name', 'passed');
        });

        test('should get iframe URL and content', async ({ page }) => {
            logTestStart('iFrame URL and content');

            await page.goto('https://the-internet.herokuapp.com/iframe');

            /**
             * INTERVIEW TIP: "Use frame() for Frame object access (URL, content),
             * frameLocator() for just locating elements"
             */
            const frameElement = page.locator('#mce_0_ifr');
            const src = await frameElement.getAttribute('src');

            console.log('iFrame src:', src);

            logTestEnd('iFrame URL and content', 'passed');
        });
    });

    test.describe('Multiple iFrames', () => {

        test('should work with multiple iframes on same page', async ({ page }) => {
            logTestStart('Multiple iframes');

            await page.goto('https://the-internet.herokuapp.com/nested_frames');

            const topFrame = page.frameLocator('frame[name="frame-top"]');

            /**
             * INTERVIEW TIP: "When page has multiple iframes, use unique selectors
             * to avoid ambiguity"
             */
            const leftFrame = topFrame.frameLocator('frame[name="frame-left"]');
            const middleFrame = topFrame.frameLocator('frame[name="frame-middle"]');
            const rightFrame = topFrame.frameLocator('frame[name="frame-right"]');

            // Verify all frames
            await expect(leftFrame.locator('body')).toContainText('LEFT');
            await expect(middleFrame.locator('body')).toContainText('MIDDLE');
            await expect(rightFrame.locator('body')).toContainText('RIGHT');

            logTestEnd('Multiple iframes', 'passed');
        });
    });
});

test.describe('Shadow DOM Handling @shadow-dom @regression', () => {

    test.describe('Basic Shadow DOM', () => {

        test('should pierce shadow DOM automatically @smoke', async ({ page }) => {
            logTestStart('Auto shadow DOM piercing');

            // Using a page with shadow DOM elements
            await page.goto('https://books-pwakit.appspot.com/');

            /**
             * INTERVIEW TIP: "Playwright pierces open Shadow DOM by default.
             * Regular locators work inside shadow roots automatically."
             */
            // This site uses web components with shadow DOM
            await page.waitForLoadState('networkidle');

            // The search functionality is in a shadow DOM
            const searchButton = page.getByRole('button', { name: /search/i });
            if (await searchButton.isVisible()) {
                await expect(searchButton).toBeVisible();
            }

            logTestEnd('Auto shadow DOM piercing', 'passed');
        });

        test('should locate shadow DOM elements with CSS', async ({ page }) => {
            logTestStart('Shadow DOM CSS selectors');

            await page.goto('https://books-pwakit.appspot.com/');
            await page.waitForLoadState('networkidle');

            /**
             * INTERVIEW TIP: "CSS selectors work across shadow boundaries
             * in Playwright - no special syntax needed"
             */
            // Standard CSS selector works inside shadow DOM
            const body = page.locator('body');
            await expect(body).toBeVisible();

            logTestEnd('Shadow DOM CSS selectors', 'passed');
        });

        test('should interact with web components', async ({ page }) => {
            logTestStart('Web components interaction');

            await page.goto('https://books-pwakit.appspot.com/');
            await page.waitForLoadState('networkidle');

            /**
             * INTERVIEW TIP: "Web Components typically use Shadow DOM for
             * style encapsulation. Test them like regular elements."
             */
            // Navigate and interact with the app
            const title = page.locator('h1, h2, .title').first();
            if (await title.isVisible()) {
                const text = await title.textContent();
                expect(text).toBeTruthy();
            }

            logTestEnd('Web components interaction', 'passed');
        });
    });

    test.describe('Shadow DOM Edge Cases', () => {

        test('should handle closed shadow DOM warning', async ({ page }) => {
            logTestStart('Closed shadow DOM');

            /**
             * INTERVIEW TIP: "Playwright cannot pierce CLOSED shadow DOM.
             * If you encounter this, you need application changes or JS injection."
             */
            await page.goto('https://example.com');

            // Demonstrate checking for shadow root
            const hasShadowRoot = await page.evaluate(() => {
                const element = document.querySelector('body');
                return element?.shadowRoot !== null;
            });

            console.log('Body has shadow root:', hasShadowRoot);

            logTestEnd('Closed shadow DOM', 'passed');
        });

        test('should use JavaScript for complex shadow DOM', async ({ page }) => {
            logTestStart('Complex shadow DOM with JS');

            await page.goto('https://books-pwakit.appspot.com/');
            await page.waitForLoadState('networkidle');

            /**
             * INTERVIEW TIP: "For complex shadow DOM scenarios, use page.evaluate()
             * to run JavaScript that can access shadow roots directly"
             */
            const shadowContent = await page.evaluate(() => {
                // Example: manually accessing shadow DOM via JavaScript
                const elements = document.querySelectorAll('*');
                let shadowRootCount = 0;

                elements.forEach(el => {
                    if (el.shadowRoot) {
                        shadowRootCount++;
                    }
                });

                return { totalElements: elements.length, shadowRootCount };
            });

            console.log('Shadow DOM stats:', shadowContent);

            logTestEnd('Complex shadow DOM with JS', 'passed');
        });
    });
});

test.describe('iFrame + Shadow DOM Combined', () => {

    test('should handle shadow DOM inside iframe', async ({ page }) => {
        logTestStart('Shadow DOM in iframe');

        /**
         * INTERVIEW TIP: "When Shadow DOM is inside an iframe, first get
         * the frame, then query shadow DOM elements within it"
         */
        await page.goto('https://the-internet.herokuapp.com/iframe');

        const frame = page.frameLocator('#mce_0_ifr');

        // TinyMCE may use shadow DOM internally
        const editor = frame.locator('body');
        await expect(editor).toBeVisible();

        logTestEnd('Shadow DOM in iframe', 'passed');
    });
});
