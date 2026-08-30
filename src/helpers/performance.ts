/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PERFORMANCE HELPER - Web Vitals & Metrics Collection
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Collect and analyze page performance metrics.
 * WHY: Performance impacts UX and SEO; catch regressions early.
 * IF NOT USED: Performance issues discovered in production.
 * INTERVIEW TIP: "We track Core Web Vitals (LCP, FID, CLS) in our test suite"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Page } from '@playwright/test';
import { logger } from './logger';

/**
 * Core Web Vitals thresholds (as defined by Google)
 *
 * INTERVIEW TIP: "Google uses these metrics for SEO ranking"
 */
export const WEB_VITALS_THRESHOLDS = {
    LCP: { good: 2500, needsImprovement: 4000 },  // Largest Contentful Paint
    FID: { good: 100, needsImprovement: 300 },    // First Input Delay
    CLS: { good: 0.1, needsImprovement: 0.25 },   // Cumulative Layout Shift
    FCP: { good: 1800, needsImprovement: 3000 },  // First Contentful Paint
    TTFB: { good: 800, needsImprovement: 1800 },  // Time to First Byte
    INP: { good: 200, needsImprovement: 500 },    // Interaction to Next Paint
};

export interface PerformanceMetrics {
    // Navigation Timing
    navigationStart: number;
    domContentLoaded: number;
    domComplete: number;
    loadComplete: number;

    // Core Web Vitals
    firstContentfulPaint: number | null;
    largestContentfulPaint: number | null;
    cumulativeLayoutShift: number | null;

    // Resource Timing
    resourceCount: number;
    totalResourceSize: number;

    // Custom Metrics
    timeToInteractive: number | null;
}

export interface PerformanceReport {
    metrics: PerformanceMetrics;
    score: 'good' | 'needs-improvement' | 'poor';
    issues: string[];
    recommendations: string[];
}

/**
 * Performance Analyzer
 *
 * INTERVIEW TIP: "We use the Performance API to collect metrics
 * directly from the browser, giving us accurate measurements"
 */
export class PerformanceAnalyzer {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Collect all performance metrics
     */
    async collectMetrics(): Promise<PerformanceMetrics> {
        logger.info('Collecting performance metrics...');

        const baseMetrics = await this.page.evaluate(() => {
            const performance = window.performance;
            const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            const paint = performance.getEntriesByType('paint');
            const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

            // Get FCP
            const fcpEntry = paint.find(entry => entry.name === 'first-contentful-paint');
            const firstContentfulPaint = fcpEntry ? fcpEntry.startTime : null;

            // Calculate total resource size
            const totalResourceSize = resources.reduce((total, resource) => {
                return total + (resource.transferSize || 0);
            }, 0);

            return {
                navigationStart: navigation.startTime,
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.startTime,
                domComplete: navigation.domComplete - navigation.startTime,
                loadComplete: navigation.loadEventEnd - navigation.startTime,
                firstContentfulPaint,
                resourceCount: resources.length,
                totalResourceSize,
            };
        });

        // Collect LCP using PerformanceObserver
        const lcp = await this.getLargestContentfulPaint();

        // Collect CLS
        const cls = await this.getCumulativeLayoutShift();

        const metrics: PerformanceMetrics = {
            ...baseMetrics,
            largestContentfulPaint: lcp,
            cumulativeLayoutShift: cls,
            timeToInteractive: null,
        };

        this.logMetrics(metrics);
        return metrics;
    }

    /**
     * Get Largest Contentful Paint (LCP)
     *
     * INTERVIEW TIP: "LCP measures when the largest content element
     * becomes visible - critical for perceived load speed"
     */
    private async getLargestContentfulPaint(): Promise<number | null> {
        try {
            return await this.page.evaluate(() => {
                return new Promise<number | null>((resolve) => {
                    let lcpValue: number | null = null;

                    const observer = new PerformanceObserver((list) => {
                        const entries = list.getEntries();
                        const lastEntry = entries[entries.length - 1];
                        lcpValue = lastEntry.startTime;
                    });

                    observer.observe({ type: 'largest-contentful-paint', buffered: true });

                    // Give it time to capture LCP, then return
                    setTimeout(() => {
                        observer.disconnect();
                        resolve(lcpValue);
                    }, 1000);
                });
            });
        } catch {
            return null;
        }
    }

    /**
     * Get Cumulative Layout Shift (CLS)
     *
     * INTERVIEW TIP: "CLS measures visual stability - how much
     * the page layout shifts during loading"
     */
    private async getCumulativeLayoutShift(): Promise<number | null> {
        try {
            return await this.page.evaluate(() => {
                return new Promise<number | null>((resolve) => {
                    let clsValue = 0;

                    const observer = new PerformanceObserver((list) => {
                        for (const entry of list.getEntries()) {
                            if (!(entry as PerformanceEntry & { hadRecentInput?: boolean }).hadRecentInput) {
                                clsValue += (entry as PerformanceEntry & { value?: number }).value || 0;
                            }
                        }
                    });

                    observer.observe({ type: 'layout-shift', buffered: true });

                    setTimeout(() => {
                        observer.disconnect();
                        resolve(clsValue);
                    }, 1000);
                });
            });
        } catch {
            return null;
        }
    }

    /**
     * Generate performance report with recommendations
     */
    async generateReport(): Promise<PerformanceReport> {
        const metrics = await this.collectMetrics();
        const issues: string[] = [];
        const recommendations: string[] = [];

        // Check LCP
        if (metrics.largestContentfulPaint !== null) {
            if (metrics.largestContentfulPaint > WEB_VITALS_THRESHOLDS.LCP.needsImprovement) {
                issues.push(`LCP is poor: ${metrics.largestContentfulPaint}ms`);
                recommendations.push('Optimize images and lazy load below-the-fold content');
            } else if (metrics.largestContentfulPaint > WEB_VITALS_THRESHOLDS.LCP.good) {
                issues.push(`LCP needs improvement: ${metrics.largestContentfulPaint}ms`);
            }
        }

        // Check FCP
        if (metrics.firstContentfulPaint !== null) {
            if (metrics.firstContentfulPaint > WEB_VITALS_THRESHOLDS.FCP.needsImprovement) {
                issues.push(`FCP is poor: ${metrics.firstContentfulPaint}ms`);
                recommendations.push('Reduce server response time and eliminate render-blocking resources');
            }
        }

        // Check CLS
        if (metrics.cumulativeLayoutShift !== null) {
            if (metrics.cumulativeLayoutShift > WEB_VITALS_THRESHOLDS.CLS.needsImprovement) {
                issues.push(`CLS is poor: ${metrics.cumulativeLayoutShift}`);
                recommendations.push('Add size attributes to images and avoid inserting content above existing content');
            }
        }

        // Check resource count
        if (metrics.resourceCount > 100) {
            issues.push(`High resource count: ${metrics.resourceCount} resources`);
            recommendations.push('Bundle and minimize resources, implement code splitting');
        }

        // Check resource size
        const sizeInMB = metrics.totalResourceSize / (1024 * 1024);
        if (sizeInMB > 3) {
            issues.push(`Large page size: ${sizeInMB.toFixed(2)}MB`);
            recommendations.push('Compress images, enable gzip/brotli, remove unused code');
        }

        // Determine overall score
        let score: 'good' | 'needs-improvement' | 'poor' = 'good';
        if (issues.some(i => i.includes('poor'))) {
            score = 'poor';
        } else if (issues.length > 0) {
            score = 'needs-improvement';
        }

        return { metrics, score, issues, recommendations };
    }

    /**
     * Assert performance meets thresholds
     *
     * INTERVIEW TIP: "We fail CI builds if performance regresses
     * beyond acceptable thresholds"
     */
    async assertPerformance(thresholds: Partial<typeof WEB_VITALS_THRESHOLDS>): Promise<void> {
        const metrics = await this.collectMetrics();
        const failures: string[] = [];

        if (thresholds.LCP && metrics.largestContentfulPaint !== null) {
            if (metrics.largestContentfulPaint > thresholds.LCP.needsImprovement) {
                failures.push(`LCP ${metrics.largestContentfulPaint}ms exceeds threshold ${thresholds.LCP.needsImprovement}ms`);
            }
        }

        if (thresholds.FCP && metrics.firstContentfulPaint !== null) {
            if (metrics.firstContentfulPaint > thresholds.FCP.needsImprovement) {
                failures.push(`FCP ${metrics.firstContentfulPaint}ms exceeds threshold ${thresholds.FCP.needsImprovement}ms`);
            }
        }

        if (thresholds.CLS && metrics.cumulativeLayoutShift !== null) {
            if (metrics.cumulativeLayoutShift > thresholds.CLS.needsImprovement) {
                failures.push(`CLS ${metrics.cumulativeLayoutShift} exceeds threshold ${thresholds.CLS.needsImprovement}`);
            }
        }

        if (failures.length > 0) {
            throw new Error(`Performance thresholds exceeded:\n${failures.join('\n')}`);
        }
    }

    /**
     * Measure time for specific action
     */
    async measureAction<T>(name: string, action: () => Promise<T>): Promise<{ result: T; duration: number }> {
        const startTime = Date.now();
        const result = await action();
        const duration = Date.now() - startTime;

        logger.info(`Action "${name}" took ${duration}ms`);
        return { result, duration };
    }

    private logMetrics(metrics: PerformanceMetrics): void {
        logger.info('Performance Metrics:');
        logger.info(`  DOM Content Loaded: ${metrics.domContentLoaded}ms`);
        logger.info(`  Load Complete: ${metrics.loadComplete}ms`);
        if (metrics.firstContentfulPaint) {
            logger.info(`  First Contentful Paint: ${metrics.firstContentfulPaint}ms`);
        }
        if (metrics.largestContentfulPaint) {
            logger.info(`  Largest Contentful Paint: ${metrics.largestContentfulPaint}ms`);
        }
        if (metrics.cumulativeLayoutShift !== null) {
            logger.info(`  Cumulative Layout Shift: ${metrics.cumulativeLayoutShift}`);
        }
        logger.info(`  Resources: ${metrics.resourceCount} (${(metrics.totalResourceSize / 1024).toFixed(0)}KB)`);
    }
}

/**
 * Factory function
 */
export function createPerformanceAnalyzer(page: Page): PerformanceAnalyzer {
    return new PerformanceAnalyzer(page);
}
