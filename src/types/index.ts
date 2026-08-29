/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TYPES BARREL EXPORT
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Single entry point for all types.
 * WHY: Clean imports - import { Employee, LeaveRequest } from '../types'
 * IF NOT USED: Long import paths in every file.
 * INTERVIEW TIP: "Barrel files reduce import complexity"
 * ═══════════════════════════════════════════════════════════════════════════
 */

export * from './employee.types';
export * from './leave.types';
export * from './auth.types';
export * from './api.types';
