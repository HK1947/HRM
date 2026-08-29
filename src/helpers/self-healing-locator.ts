/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SELF-HEALING LOCATOR - Strategy + Chain of Responsibility Patterns
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: AI-powered locator system that tries multiple strategies.
 * WHY: Tests break when locators change - this auto-recovers.
 * IF NOT USED: Single locator failure = test failure, high maintenance.
 * INTERVIEW TIP: "Chain of Responsibility tries each strategy until one works"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Page, Locator } from '@playwright/test';
import { logger } from './logger';

export interface LocatorStrategy {
    name: string;
    priority: number;
    getLocator(page: Page, context: LocatorContext): Locator | null;
}

export interface LocatorContext {
    testId?: string;
    role?: string;
    roleOptions?: { name?: string | RegExp; exact?: boolean };
    text?: string;
    placeholder?: string;
    label?: string;
    css?: string;
    xpath?: string;
}

export interface HealingResult {
    locator: Locator;
    strategyUsed: string;
    attemptedStrategies: string[];
    healed: boolean;
}

class TestIdStrategy implements LocatorStrategy {
    name = 'testId';
    priority = 1;

    getLocator(page: Page, context: LocatorContext): Locator | null {
        if (!context.testId) return null;
        return page.getByTestId(context.testId);
    }
}

class RoleStrategy implements LocatorStrategy {
    name = 'role';
    priority = 2;

    getLocator(page: Page, context: LocatorContext): Locator | null {
        if (!context.role) return null;
        const role = context.role as Parameters<Page['getByRole']>[0];
        return page.getByRole(role, context.roleOptions);
    }
}

class TextStrategy implements LocatorStrategy {
    name = 'text';
    priority = 3;

    getLocator(page: Page, context: LocatorContext): Locator | null {
        if (!context.text) return null;
        return page.getByText(context.text);
    }
}

class PlaceholderStrategy implements LocatorStrategy {
    name = 'placeholder';
    priority = 4;

    getLocator(page: Page, context: LocatorContext): Locator | null {
        if (!context.placeholder) return null;
        return page.getByPlaceholder(context.placeholder);
    }
}

class LabelStrategy implements LocatorStrategy {
    name = 'label';
    priority = 5;

    getLocator(page: Page, context: LocatorContext): Locator | null {
        if (!context.label) return null;
        return page.getByLabel(context.label);
    }
}

class CssStrategy implements LocatorStrategy {
    name = 'css';
    priority = 6;

    getLocator(page: Page, context: LocatorContext): Locator | null {
        if (!context.css) return null;
        return page.locator(context.css);
    }
}

class XPathStrategy implements LocatorStrategy {
    name = 'xpath';
    priority = 7;

    getLocator(page: Page, context: LocatorContext): Locator | null {
        if (!context.xpath) return null;
        return page.locator(`xpath=${context.xpath}`);
    }
}

export class SelfHealingLocator {
    private strategies: LocatorStrategy[];
    private healingLog: Map<string, HealingResult> = new Map();

    constructor(customStrategies?: LocatorStrategy[]) {
        this.strategies = customStrategies || [
            new TestIdStrategy(),
            new RoleStrategy(),
            new TextStrategy(),
            new PlaceholderStrategy(),
            new LabelStrategy(),
            new CssStrategy(),
            new XPathStrategy()
        ];
        this.strategies.sort((a, b) => a.priority - b.priority);
    }

    async findElement(
        page: Page,
        context: LocatorContext,
        elementName: string
    ): Promise<HealingResult> {
        const attemptedStrategies: string[] = [];
        let primaryStrategy: string | null = null;

        for (const strategy of this.strategies) {
            const locator = strategy.getLocator(page, context);
            if (!locator) continue;

            attemptedStrategies.push(strategy.name);

            try {
                const count = await locator.count();
                if (count > 0) {
                    const healed = primaryStrategy !== null;
                    const result: HealingResult = {
                        locator,
                        strategyUsed: strategy.name,
                        attemptedStrategies,
                        healed
                    };

                    if (healed) {
                        logger.warn(
                            `Self-healed "${elementName}": ${primaryStrategy} → ${strategy.name}`
                        );
                    } else {
                        logger.debug(`Found "${elementName}" using ${strategy.name}`);
                    }

                    this.healingLog.set(elementName, result);
                    return result;
                }
            } catch {
                logger.debug(`Strategy ${strategy.name} failed for "${elementName}"`);
            }

            if (!primaryStrategy) {
                primaryStrategy = strategy.name;
            }
        }

        throw new Error(
            `Self-healing failed for "${elementName}". ` +
            `Tried: ${attemptedStrategies.join(', ')}`
        );
    }

    getHealingReport(): Map<string, HealingResult> {
        return new Map(this.healingLog);
    }

    clearHealingLog(): void {
        this.healingLog.clear();
    }
}

export const selfHealingLocator = new SelfHealingLocator();
