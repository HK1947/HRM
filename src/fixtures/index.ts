/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FIXTURES BARREL EXPORT - Merged Test Instance
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Combines all fixtures into single test export.
 * WHY: Tests import one 'test' that has all fixtures.
 * IF NOT USED: Separate fixture imports, messy test files.
 * INTERVIEW TIP: "mergeTests combines fixtures - single import for tests"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { mergeTests } from '@playwright/test';
import { pageFixtures, PageFixtures } from './page.fixtures';
import { authFixtures, AuthFixtures } from './auth.fixtures';

export type AllFixtures = PageFixtures & AuthFixtures;

export const test = mergeTests(pageFixtures, authFixtures);

export { expect } from '@playwright/test';

export type { PageFixtures } from './page.fixtures';
export type { AuthFixtures } from './auth.fixtures';
