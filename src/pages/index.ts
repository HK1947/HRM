/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PAGES BARREL EXPORT
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Single entry point for all page objects.
 * WHY: Clean imports - import { LoginPage, DashboardPage } from '../pages'
 * IF NOT USED: Long import paths in every test file.
 * INTERVIEW TIP: "Barrel files simplify imports and hide internal structure"
 * ═══════════════════════════════════════════════════════════════════════════
 */

export * from './base.page';
export * from './components';
export * from './login.page';
