/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ACCESSIBILITY HELPER - Axe-Core Integration
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Automated accessibility testing using axe-core.
 * WHY: Legal compliance (ADA, WCAG), inclusive design, broader user base.
 * IF NOT USED: Accessibility issues slip to production, potential lawsuits.
 * INTERVIEW TIP: "axe-core catches WCAG violations automatically in CI/CD"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { logger } from './logger';

export interface A11yViolation {
    id: string;
    impact: 'minor' | 'moderate' | 'serious' | 'critical';
    description: string;
    helpUrl: string;
    nodes: Array<{
        html: string;
        target: string[];
        failureSummary: string;
    }>;
}

export interface A11yResult {
    violations: A11yViolation[];
    passes: number;
    incomplete: number;
    inapplicable: number;
}

export type A11yStandard = 'wcag2a' | 'wcag2aa' | 'wcag2aaa' | 'wcag21a' | 'wcag21aa' | 'wcag22aa' | 'best-practice';

export interface A11yOptions {
    standard?: A11yStandard;
    includedRules?: string[];
    excludedRules?: string[];
    excludedElements?: string[];
    includedImpact?: ('minor' | 'moderate' | 'serious' | 'critical')[];
}

/**
 * Accessibility Checker using axe-core
 *
 * INTERVIEW TIP: "We use axe-core which tests against WCAG 2.1 AA by default,
 * catching issues like missing alt text, low contrast, and keyboard traps"
 */
export class AccessibilityChecker {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Run accessibility audit on current page
     *
     * INTERVIEW TIP: "axe.analyze() returns violations with impact levels,
     * allowing us to fail on critical issues but warn on minor ones"
     */
    async analyze(options: A11yOptions = {}): Promise<A11yResult> {
        logger.info('Running accessibility audit...');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let builder = new AxeBuilder({ page: this.page as any });

        // Apply WCAG standard
        if (options.standard) {
            builder = builder.withTags([options.standard]);
        } else {
            // Default to WCAG 2.1 AA (most common requirement)
            builder = builder.withTags(['wcag21aa', 'best-practice']);
        }

        // Include specific rules
        if (options.includedRules?.length) {
            builder = builder.withRules(options.includedRules);
        }

        // Exclude specific rules
        if (options.excludedRules?.length) {
            builder = builder.disableRules(options.excludedRules);
        }

        // Exclude elements (e.g., third-party widgets)
        if (options.excludedElements?.length) {
            builder = builder.exclude(options.excludedElements);
        }

        const results = await builder.analyze();

        // Filter by impact if specified
        let violations = results.violations as A11yViolation[];
        if (options.includedImpact?.length) {
            violations = violations.filter(v =>
                options.includedImpact!.includes(v.impact)
            );
        }

        const result: A11yResult = {
            violations,
            passes: results.passes.length,
            incomplete: results.incomplete.length,
            inapplicable: results.inapplicable.length,
        };

        this.logResults(result);
        return result;
    }

    /**
     * Check specific element for accessibility
     */
    async analyzeElement(selector: string, options: A11yOptions = {}): Promise<A11yResult> {
        logger.info(`Running accessibility audit on element: ${selector}`);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let builder = new AxeBuilder({ page: this.page as any })
            .include(selector);

        if (options.standard) {
            builder = builder.withTags([options.standard]);
        }

        const results = await builder.analyze();

        return {
            violations: results.violations as A11yViolation[],
            passes: results.passes.length,
            incomplete: results.incomplete.length,
            inapplicable: results.inapplicable.length,
        };
    }

    /**
     * Get violations filtered by impact level
     *
     * INTERVIEW TIP: "We fail CI on critical/serious issues,
     * but log moderate/minor as warnings for future fixes"
     */
    async getCriticalViolations(): Promise<A11yViolation[]> {
        const result = await this.analyze({
            includedImpact: ['critical', 'serious']
        });
        return result.violations;
    }

    /**
     * Check if page meets WCAG 2.1 AA (most common compliance level)
     */
    async isWCAG21AACompliant(): Promise<boolean> {
        const result = await this.analyze({ standard: 'wcag21aa' });
        return result.violations.length === 0;
    }

    private logResults(result: A11yResult): void {
        logger.info(`A11y Audit Complete: ${result.passes} passes, ${result.violations.length} violations`);

        if (result.violations.length > 0) {
            result.violations.forEach(violation => {
                logger.warn(`[${violation.impact.toUpperCase()}] ${violation.id}: ${violation.description}`);
                violation.nodes.forEach(node => {
                    logger.debug(`  - Element: ${node.target.join(' > ')}`);
                    logger.debug(`    ${node.failureSummary}`);
                });
            });
        }
    }

    /**
     * Generate HTML report of violations
     *
     * INTERVIEW TIP: "We generate detailed a11y reports for developers
     * showing exact elements and how to fix them"
     */
    formatViolationsReport(violations: A11yViolation[]): string {
        if (violations.length === 0) {
            return '✓ No accessibility violations found';
        }

        let report = `Found ${violations.length} accessibility violations:\n\n`;

        violations.forEach((violation, index) => {
            report += `${index + 1}. [${violation.impact.toUpperCase()}] ${violation.id}\n`;
            report += `   Description: ${violation.description}\n`;
            report += `   Help: ${violation.helpUrl}\n`;
            report += `   Affected elements:\n`;
            violation.nodes.forEach(node => {
                report += `   - ${node.target.join(' > ')}\n`;
                report += `     ${node.failureSummary}\n`;
            });
            report += '\n';
        });

        return report;
    }
}

/**
 * Factory function to create accessibility checker
 */
export function createA11yChecker(page: Page): AccessibilityChecker {
    return new AccessibilityChecker(page);
}
