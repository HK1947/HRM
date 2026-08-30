/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HELPERS INDEX - Barrel Export
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Central export point for all helper modules.
 * WHY: Clean imports - one line imports all helpers.
 * IF NOT USED: Multiple import lines, harder to maintain.
 * INTERVIEW TIP: "Barrel exports simplify imports and enforce module boundaries"
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Logger
export { logger, logTestStart, logTestEnd, logStep } from './logger';

// Data Factory
export { DataFactory } from './data-factory';

// Schema Validator
export { SchemaValidator, SchemaValidationError, schemaValidator } from './schema-validator';

// Self-Healing Locator
export {
    SelfHealingLocator,
    selfHealingLocator,
    type LocatorStrategy,
    type LocatorContext,
    type HealingResult
} from './self-healing-locator';

// Accessibility Helper
export {
    AccessibilityChecker,
    createA11yChecker,
    type A11yViolation,
    type A11yResult,
    type A11yStandard,
    type A11yOptions
} from './accessibility';

// Retry Helper
export {
    retry,
    retryUntil,
    CircuitBreaker,
    sleep,
    withTimeout,
    addJitter,
    type RetryOptions,
    type RetryResult
} from './retry';

// Custom Matchers
export {
    customMatchers,
    SoftAssert,
    createSoftAssert,
    waitForCondition
} from './custom-matchers';

// Performance Helper
export {
    PerformanceAnalyzer,
    createPerformanceAnalyzer,
    WEB_VITALS_THRESHOLDS,
    type PerformanceMetrics,
    type PerformanceReport
} from './performance';

// Test Data Helper
export {
    TestDataManager,
    createTestDataManager,
    testDataFactory,
    type TestEmployee,
    type TestUser,
    type TestLeaveRequest
} from './test-data';

// Allure Steps
export {
    step,
    wrapStep,
    attachToReport,
    attachJSON,
    attachScreenshot,
    addAnnotation,
    allure,
    precondition,
    action,
    verify,
    cleanup,
    testCategory
} from './allure-steps';
