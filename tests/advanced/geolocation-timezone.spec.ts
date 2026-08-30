/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GEOLOCATION & TIMEZONE TESTS - Location Mocking
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Test location-aware features by mocking geolocation and timezone.
 * WHY: Apps behave differently based on user location (stores, content, currency).
 * IF NOT USED: Can't test location-specific features without being there.
 * INTERVIEW TIP: "Playwright mocks geolocation at browser level, not network"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { test, expect } from '@playwright/test';
import { logTestStart, logTestEnd } from '../../src/helpers';

/**
 * Location test data
 */
const locations = {
    newYork: { latitude: 40.7128, longitude: -74.006, timezone: 'America/New_York' },
    london: { latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
    tokyo: { latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' },
    sydney: { latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney' },
    amsterdam: { latitude: 52.3676, longitude: 4.9041, timezone: 'Europe/Amsterdam' },
};

test.describe('Geolocation Mocking @geolocation @regression', () => {

    test.describe('Basic Geolocation', () => {

        test('should mock geolocation coordinates @smoke', async ({ browser }) => {
            logTestStart('Mock geolocation');

            /**
             * INTERVIEW TIP: "Set geolocation in context options before
             * creating pages - it applies to all pages in that context"
             */
            const context = await browser.newContext({
                geolocation: locations.newYork,
                permissions: ['geolocation']
            });

            const page = await context.newPage();

            // Navigate to a page that uses geolocation
            await page.goto('https://www.google.com/maps');

            // Verify geolocation is accessible
            const coords = await page.evaluate(() => {
                return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(
                        pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                        err => reject(err)
                    );
                });
            });

            expect(coords.lat).toBeCloseTo(locations.newYork.latitude, 1);
            expect(coords.lng).toBeCloseTo(locations.newYork.longitude, 1);

            await context.close();

            logTestEnd('Mock geolocation', 'passed');
        });

        test('should change geolocation mid-test', async ({ browser }) => {
            logTestStart('Change geolocation');

            const context = await browser.newContext({
                geolocation: locations.london,
                permissions: ['geolocation']
            });

            const page = await context.newPage();
            await page.goto('https://example.com');

            /**
             * INTERVIEW TIP: "Use context.setGeolocation() to change
             * location during test - simulates user traveling"
             */
            // Start in London
            let coords = await page.evaluate(() => {
                return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(
                        pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                        err => reject(err)
                    );
                });
            });

            expect(coords.lat).toBeCloseTo(locations.london.latitude, 1);

            // "Travel" to Tokyo
            await context.setGeolocation(locations.tokyo);

            coords = await page.evaluate(() => {
                return new Promise<{ lat: number; lng: number }>((resolve) => {
                    navigator.geolocation.getCurrentPosition(
                        pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude })
                    );
                });
            });

            expect(coords.lat).toBeCloseTo(locations.tokyo.latitude, 1);

            await context.close();

            logTestEnd('Change geolocation', 'passed');
        });

        test('should test geolocation permission denied', async ({ browser }) => {
            logTestStart('Geolocation denied');

            /**
             * INTERVIEW TIP: "Test how your app handles denied permissions -
             * users often deny geolocation"
             */
            const context = await browser.newContext({
                // Don't grant geolocation permission
                permissions: []
            });

            const page = await context.newPage();
            await page.goto('https://example.com');

            // Try to get location - should fail
            const result = await page.evaluate(() => {
                return new Promise<string>((resolve) => {
                    navigator.geolocation.getCurrentPosition(
                        () => resolve('success'),
                        (err) => resolve(`error: ${err.code}`)
                    );
                });
            });

            expect(result).toContain('error');

            await context.close();

            logTestEnd('Geolocation denied', 'passed');
        });
    });

    test.describe('Location-Based Testing', () => {

        test('should test store locator with different locations', async ({ browser }) => {
            logTestStart('Store locator testing');

            /**
             * INTERVIEW TIP: "Use parameterized geolocation to test store
             * locators, delivery zones, and regional content"
             */
            for (const [name, location] of Object.entries(locations)) {
                const context = await browser.newContext({
                    geolocation: { latitude: location.latitude, longitude: location.longitude },
                    permissions: ['geolocation']
                });

                const page = await context.newPage();

                // A real test would navigate to a store locator page
                await page.goto('https://example.com');

                console.log(`Testing from ${name}: ${location.latitude}, ${location.longitude}`);

                await context.close();
            }

            logTestEnd('Store locator testing', 'passed');
        });
    });
});

test.describe('Timezone Mocking @timezone @regression', () => {

    test.describe('Basic Timezone', () => {

        test('should mock timezone @smoke', async ({ browser }) => {
            logTestStart('Mock timezone');

            /**
             * INTERVIEW TIP: "timezoneId in context options sets the browser's
             * timezone - affects Date objects and Intl APIs"
             */
            const context = await browser.newContext({
                timezoneId: 'America/New_York'
            });

            const page = await context.newPage();
            await page.goto('https://example.com');

            const timezone = await page.evaluate(() => {
                return Intl.DateTimeFormat().resolvedOptions().timeZone;
            });

            expect(timezone).toBe('America/New_York');

            await context.close();

            logTestEnd('Mock timezone', 'passed');
        });

        test('should test date display in different timezones', async ({ browser }) => {
            logTestStart('Date display by timezone');

            /**
             * INTERVIEW TIP: "Test date/time display across timezones to
             * ensure correct conversion and formatting"
             */
            const testDate = new Date('2024-01-15T12:00:00Z'); // Noon UTC

            for (const [name, location] of Object.entries(locations)) {
                const context = await browser.newContext({
                    timezoneId: location.timezone
                });

                const page = await context.newPage();
                await page.goto('https://example.com');

                const localTime = await page.evaluate((isoDate) => {
                    const date = new Date(isoDate);
                    return date.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    });
                }, testDate.toISOString());

                console.log(`${name} (${location.timezone}): ${localTime}`);

                await context.close();
            }

            logTestEnd('Date display by timezone', 'passed');
        });

        test('should handle DST transitions', async ({ browser }) => {
            logTestStart('DST transition testing');

            const context = await browser.newContext({
                timezoneId: 'America/New_York'
            });

            const page = await context.newPage();
            await page.goto('https://example.com');

            /**
             * INTERVIEW TIP: "Test dates around DST transitions to catch
             * timezone-related bugs (March/November for US)"
             */
            const dstDates = [
                '2024-03-10T02:30:00', // During spring forward
                '2024-11-03T01:30:00', // During fall back
            ];

            for (const dateStr of dstDates) {
                const result = await page.evaluate((d) => {
                    const date = new Date(d);
                    return {
                        local: date.toLocaleString(),
                        offset: date.getTimezoneOffset()
                    };
                }, dateStr);

                console.log(`${dateStr}: ${result.local} (offset: ${result.offset})`);
            }

            await context.close();

            logTestEnd('DST transition testing', 'passed');
        });
    });

    test.describe('Combined Geolocation and Timezone', () => {

        test('should mock both geolocation and timezone', async ({ browser }) => {
            logTestStart('Combined geo + timezone');

            /**
             * INTERVIEW TIP: "For realistic location testing, set BOTH
             * geolocation and timezone to match"
             */
            const context = await browser.newContext({
                geolocation: locations.tokyo,
                timezoneId: locations.tokyo.timezone,
                permissions: ['geolocation'],
                locale: 'ja-JP' // Also set locale for complete simulation
            });

            const page = await context.newPage();
            await page.goto('https://example.com');

            // Verify timezone
            const timezone = await page.evaluate(() => {
                return Intl.DateTimeFormat().resolvedOptions().timeZone;
            });
            expect(timezone).toBe('Asia/Tokyo');

            // Verify geolocation
            const coords = await page.evaluate(() => {
                return new Promise<{ lat: number; lng: number }>((resolve) => {
                    navigator.geolocation.getCurrentPosition(
                        pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude })
                    );
                });
            });
            expect(coords.lat).toBeCloseTo(locations.tokyo.latitude, 1);

            // Verify locale
            const locale = await page.evaluate(() => {
                return navigator.language;
            });
            expect(locale).toBe('ja-JP');

            await context.close();

            logTestEnd('Combined geo + timezone', 'passed');
        });

        test('should test international e-commerce scenario', async ({ browser }) => {
            logTestStart('International e-commerce');

            /**
             * INTERVIEW TIP: "E-commerce tests often need to verify pricing,
             * currency, and shipping based on user location"
             */
            const regions = [
                { ...locations.newYork, locale: 'en-US', currency: 'USD' },
                { ...locations.london, locale: 'en-GB', currency: 'GBP' },
                { ...locations.tokyo, locale: 'ja-JP', currency: 'JPY' },
            ];

            for (const region of regions) {
                const context = await browser.newContext({
                    geolocation: { latitude: region.latitude, longitude: region.longitude },
                    timezoneId: region.timezone,
                    locale: region.locale,
                    permissions: ['geolocation']
                });

                const page = await context.newPage();
                await page.goto('https://example.com');

                // Verify locale settings
                const browserLocale = await page.evaluate(() => navigator.language);
                expect(browserLocale).toBe(region.locale);

                console.log(`Region: ${region.timezone}, Locale: ${browserLocale}, Currency: ${region.currency}`);

                await context.close();
            }

            logTestEnd('International e-commerce', 'passed');
        });
    });
});

test.describe('Locale Mocking @locale @regression', () => {

    test('should mock browser locale', async ({ browser }) => {
        logTestStart('Mock locale');

        /**
         * INTERVIEW TIP: "locale option sets navigator.language and affects
         * number/date formatting, not just translations"
         */
        const context = await browser.newContext({
            locale: 'de-DE'
        });

        const page = await context.newPage();
        await page.goto('https://example.com');

        const browserLocale = await page.evaluate(() => navigator.language);
        expect(browserLocale).toBe('de-DE');

        // Verify number formatting
        const formattedNumber = await page.evaluate(() => {
            return new Intl.NumberFormat().format(1234.56);
        });
        expect(formattedNumber).toBe('1.234,56'); // German format

        await context.close();

        logTestEnd('Mock locale', 'passed');
    });

    test('should test date formatting by locale', async ({ browser }) => {
        logTestStart('Date formatting by locale');

        const locales = ['en-US', 'en-GB', 'de-DE', 'ja-JP', 'nl-NL'];

        for (const locale of locales) {
            const context = await browser.newContext({ locale });
            const page = await context.newPage();
            await page.goto('https://example.com');

            const formattedDate = await page.evaluate(() => {
                const date = new Date('2024-12-25');
                return date.toLocaleDateString();
            });

            console.log(`${locale}: ${formattedDate}`);

            await context.close();
        }

        logTestEnd('Date formatting by locale', 'passed');
    });
});
