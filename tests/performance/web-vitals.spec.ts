/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PERFORMANCE TESTS - Web Vitals & Metrics
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Measure and assert on page performance metrics.
 * WHY: Performance impacts UX, SEO, and conversion rates.
 * IF NOT USED: Performance regressions go undetected until production.
 * INTERVIEW TIP: "We track Core Web Vitals (LCP, FID, CLS) as part of CI/CD"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { test, expect } from '@playwright/test';
import { createPerformanceAnalyzer, WEB_VITALS_THRESHOLDS } from '../../src/helpers/performance';
import { LoginPage } from '../../src/pages';
import { logTestStart, logTestEnd } from '../../src/helpers';

test.describe('Performance Tests @performance @regression', () => {

    test.describe('Core Web Vitals', () => {

        test('should measure page load performance @smoke', async ({ page }) => {
            logTestStart('Page load performance');

            const loginPage = new LoginPage(page);
            await loginPage.navigate();

            const perf = createPerformanceAnalyzer(page);
            const metrics = await perf.collectMetrics();

            /**
             * INTERVIEW TIP: "We measure DOM Content Loaded and Load Complete
             * as primary page load indicators"
             */
            console.log('Performance Metrics:');
            console.log(`  DOM Content Loaded: ${metrics.domContentLoaded}ms`);
            console.log(`  Load Complete: ${metrics.loadComplete}ms`);
            console.log(`  FCP: ${metrics.firstContentfulPaint}ms`);
            console.log(`  LCP: ${metrics.largestContentfulPaint}ms`);
            console.log(`  CLS: ${metrics.cumulativeLayoutShift}`);
            console.log(`  Resources: ${metrics.resourceCount}`);

            // Basic performance assertions
            expect(metrics.domContentLoaded).toBeLessThan(5000);
            expect(metrics.loadComplete).toBeLessThan(10000);

            logTestEnd('Page load performance', 'passed');
        });

        test('should generate performance report', async ({ page }) => {
            logTestStart('Performance report');

            const loginPage = new LoginPage(page);
            await loginPage.navigate();

            const perf = createPerformanceAnalyzer(page);
            const report = await perf.generateReport();

            /**
             * INTERVIEW TIP: "Performance reports help developers understand
             * what to optimize and prioritize improvements"
             */
            console.log('Performance Score:', report.score);
            console.log('Issues:', report.issues);
            console.log('Recommendations:', report.recommendations);

            // Allow up to 'needs-improvement' (demo site may not be optimized)
            expect(['good', 'needs-improvement']).toContain(report.score);

            logTestEnd('Performance report', 'passed');
        });

        test('should measure First Contentful Paint (FCP)', async ({ page }) => {
            logTestStart('FCP measurement');

            /**
             * INTERVIEW TIP: "FCP measures when the first content appears -
             * critical for perceived performance"
             */
            const loginPage = new LoginPage(page);
            await loginPage.navigate();

            const perf = createPerformanceAnalyzer(page);
            const metrics = await perf.collectMetrics();

            if (metrics.firstContentfulPaint !== null) {
                console.log(`FCP: ${metrics.firstContentfulPaint}ms`);

                // FCP should be under threshold
                if (metrics.firstContentfulPaint > WEB_VITALS_THRESHOLDS.FCP.needsImprovement) {
                    console.warn('FCP is poor - consider optimizing critical rendering path');
                }
            }

            logTestEnd('FCP measurement', 'passed');
        });

        test('should measure Largest Contentful Paint (LCP)', async ({ page }) => {
            logTestStart('LCP measurement');

            const loginPage = new LoginPage(page);
            await loginPage.navigate();

            // Wait for LCP to stabilize
            await page.waitForTimeout(2000);

            const perf = createPerformanceAnalyzer(page);
            const metrics = await perf.collectMetrics();

            /**
             * INTERVIEW TIP: "LCP measures when the largest content element
             * is rendered - Google uses this for SEO ranking"
             */
            if (metrics.largestContentfulPaint !== null) {
                console.log(`LCP: ${metrics.largestContentfulPaint}ms`);

                // Good: < 2.5s, Needs Improvement: 2.5-4s, Poor: > 4s
                if (metrics.largestContentfulPaint <= WEB_VITALS_THRESHOLDS.LCP.good) {
                    console.log('LCP is GOOD');
                } else if (metrics.largestContentfulPaint <= WEB_VITALS_THRESHOLDS.LCP.needsImprovement) {
                    console.log('LCP NEEDS IMPROVEMENT');
                } else {
                    console.log('LCP is POOR');
                }
            }

            logTestEnd('LCP measurement', 'passed');
        });

        test('should measure Cumulative Layout Shift (CLS)', async ({ page }) => {
            logTestStart('CLS measurement');

            const loginPage = new LoginPage(page);
            await loginPage.navigate();

            // Wait for page to settle
            await page.waitForTimeout(2000);

            const perf = createPerformanceAnalyzer(page);
            const metrics = await perf.collectMetrics();

            /**
             * INTERVIEW TIP: "CLS measures visual stability - low CLS means
             * elements don't jump around during load"
             */
            if (metrics.cumulativeLayoutShift !== null) {
                console.log(`CLS: ${metrics.cumulativeLayoutShift}`);

                // Good: < 0.1, Needs Improvement: 0.1-0.25, Poor: > 0.25
                expect(metrics.cumulativeLayoutShift).toBeLessThan(0.5);
            }

            logTestEnd('CLS measurement', 'passed');
        });
    });

    test.describe('Action Timing', () => {

        test('should measure login action performance', async ({ page }) => {
            logTestStart('Login action timing');

            const loginPage = new LoginPage(page);
            await loginPage.navigate();

            const perf = createPerformanceAnalyzer(page);

            /**
             * INTERVIEW TIP: "Measure critical user actions to catch
             * performance regressions in specific features"
             */
            const { duration } = await perf.measureAction('login', async () => {
                await loginPage.login({ username: 'Admin', password: 'admin123' });
                await page.waitForURL('**/dashboard/**');
            });

            console.log(`Login action took: ${duration}ms`);

            // Login should complete within reasonable time
            expect(duration).toBeLessThan(10000);

            logTestEnd('Login action timing', 'passed');
        });

        test('should measure navigation performance', async ({ page }) => {
            logTestStart('Navigation timing');

            const loginPage = new LoginPage(page);
            await loginPage.navigate();
            await loginPage.login({ username: 'Admin', password: 'admin123' });
            await page.waitForURL('**/dashboard/**');

            const perf = createPerformanceAnalyzer(page);

            /**
             * INTERVIEW TIP: "Navigation timing helps identify slow transitions
             * between pages - often due to API calls"
             */
            const { duration: pimDuration } = await perf.measureAction('navigate to PIM', async () => {
                await page.click('text=PIM');
                await page.waitForLoadState('networkidle');
            });

            console.log(`PIM navigation: ${pimDuration}ms`);

            const { duration: adminDuration } = await perf.measureAction('navigate to Admin', async () => {
                await page.click('text=Admin');
                await page.waitForLoadState('networkidle');
            });

            console.log(`Admin navigation: ${adminDuration}ms`);

            logTestEnd('Navigation timing', 'passed');
        });
    });

    test.describe('Resource Analysis', () => {

        test('should analyze page resources', async ({ page }) => {
            logTestStart('Resource analysis');

            const loginPage = new LoginPage(page);
            await loginPage.navigate();

            /**
             * INTERVIEW TIP: "Analyzing resources helps identify large files,
             * too many requests, and optimization opportunities"
             */
            const resources = await page.evaluate(() => {
                const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
                return entries.map(r => ({
                    name: r.name.split('/').pop(),
                    type: r.initiatorType,
                    size: r.transferSize,
                    duration: r.duration
                })).sort((a, b) => b.size - a.size).slice(0, 10);
            });

            console.log('Top 10 Largest Resources:');
            resources.forEach((r, i) => {
                console.log(`  ${i + 1}. ${r.name} (${r.type}): ${(r.size / 1024).toFixed(1)}KB, ${r.duration.toFixed(0)}ms`);
            });

            // Total resource count
            const perf = createPerformanceAnalyzer(page);
            const metrics = await perf.collectMetrics();

            console.log(`Total resources: ${metrics.resourceCount}`);
            console.log(`Total size: ${(metrics.totalResourceSize / 1024 / 1024).toFixed(2)}MB`);

            logTestEnd('Resource analysis', 'passed');
        });

        test('should detect slow resources', async ({ page }) => {
            logTestStart('Slow resource detection');

            const loginPage = new LoginPage(page);
            await loginPage.navigate();

            /**
             * INTERVIEW TIP: "Identify resources that take too long -
             * often external APIs or unoptimized images"
             */
            const slowResources = await page.evaluate(() => {
                const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
                return entries
                    .filter(r => r.duration > 500)
                    .map(r => ({
                        name: r.name,
                        duration: r.duration
                    }));
            });

            if (slowResources.length > 0) {
                console.log('Slow resources (>500ms):');
                slowResources.forEach(r => {
                    console.log(`  - ${r.name}: ${r.duration.toFixed(0)}ms`);
                });
            } else {
                console.log('No slow resources detected');
            }

            logTestEnd('Slow resource detection', 'passed');
        });
    });

    test.describe('Performance Assertions', () => {

        test('should fail on poor performance', async ({ page }) => {
            logTestStart('Performance assertions');

            const loginPage = new LoginPage(page);
            await loginPage.navigate();

            const perf = createPerformanceAnalyzer(page);

            /**
             * INTERVIEW TIP: "Set performance budgets and fail CI builds
             * when they're exceeded to prevent regressions"
             */
            // These are lenient thresholds for demo purposes
            const lenientThresholds = {
                LCP: { good: 5000, needsImprovement: 10000 },
                FCP: { good: 3000, needsImprovement: 6000 },
                CLS: { good: 0.5, needsImprovement: 1.0 },
            };

            // This will throw if thresholds are exceeded
            await perf.assertPerformance(lenientThresholds);

            logTestEnd('Performance assertions', 'passed');
        });

        test('should compare performance across pages', async ({ page }) => {
            logTestStart('Performance comparison');

            const results: Record<string, number> = {};
            const pages = [
                { name: 'Login', url: 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login' },
            ];

            /**
             * INTERVIEW TIP: "Compare performance across pages to identify
             * which pages need optimization"
             */
            for (const p of pages) {
                await page.goto(p.url);
                await page.waitForLoadState('networkidle');

                const perf = createPerformanceAnalyzer(page);
                const metrics = await perf.collectMetrics();

                results[p.name] = metrics.loadComplete;
            }

            console.log('Page Load Times:');
            Object.entries(results).forEach(([name, time]) => {
                console.log(`  ${name}: ${time}ms`);
            });

            logTestEnd('Performance comparison', 'passed');
        });
    });

    test.describe('Network Throttling', () => {

        test('should test performance on slow network', async ({ browser }) => {
            logTestStart('Slow network simulation');

            /**
             * INTERVIEW TIP: "Test on slow connections to ensure your app
             * is usable for users with poor connectivity"
             */
            const context = await browser.newContext();
            const page = await context.newPage();

            // Simulate slow 3G
            const client = await page.context().newCDPSession(page);
            await client.send('Network.emulateNetworkConditions', {
                offline: false,
                downloadThroughput: (500 * 1024) / 8, // 500 Kbps
                uploadThroughput: (500 * 1024) / 8,
                latency: 400 // 400ms latency
            });

            const startTime = Date.now();
            await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
            await page.waitForLoadState('networkidle');
            const loadTime = Date.now() - startTime;

            console.log(`Load time on slow 3G: ${loadTime}ms`);

            // Even on slow network, page should eventually load
            expect(loadTime).toBeLessThan(60000);

            await context.close();

            logTestEnd('Slow network simulation', 'passed');
        });
    });
});
