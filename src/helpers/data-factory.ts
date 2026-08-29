/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DATA FACTORY - Factory Pattern
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Generates test data with sensible defaults and overrides.
 * WHY: Consistent test data, DRY principle, easy to maintain.
 * IF NOT USED: Duplicated test data across tests, inconsistent values.
 * INTERVIEW TIP: "Factory pattern encapsulates object creation - tests don't care HOW data is made"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import {
    Employee,
    EmployeeStatus,
    CreateEmployeePayload,
    LeaveRequest,
    LeaveType,
    LeaveStatus,
    ApplyLeavePayload,
    LoginCredentials
} from '../types';

let employeeCounter = 0;
let leaveCounter = 0;

function generateUniqueId(prefix: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 6);
    return `${prefix}_${timestamp}_${random}`;
}

export class DataFactory {
    static createEmployee(overrides: Partial<Employee> = {}): Employee {
        employeeCounter++;
        return {
            employeeId: generateUniqueId('EMP'),
            firstName: `TestFirst${employeeCounter}`,
            lastName: `TestLast${employeeCounter}`,
            status: EmployeeStatus.ACTIVE,
            ...overrides
        };
    }

    static createEmployeePayload(overrides: Partial<CreateEmployeePayload> = {}): CreateEmployeePayload {
        employeeCounter++;
        return {
            firstName: `NewFirst${employeeCounter}`,
            lastName: `NewLast${employeeCounter}`,
            ...overrides
        };
    }

    static createLeaveRequest(overrides: Partial<LeaveRequest> = {}): LeaveRequest {
        leaveCounter++;
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return {
            id: generateUniqueId('LV'),
            employeeId: generateUniqueId('EMP'),
            leaveType: LeaveType.ANNUAL,
            fromDate: today.toISOString().split('T')[0],
            toDate: tomorrow.toISOString().split('T')[0],
            status: LeaveStatus.PENDING,
            ...overrides
        };
    }

    static createLeavePayload(overrides: Partial<ApplyLeavePayload> = {}): ApplyLeavePayload {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return {
            employeeId: generateUniqueId('EMP'),
            leaveType: LeaveType.ANNUAL,
            fromDate: today.toISOString().split('T')[0],
            toDate: tomorrow.toISOString().split('T')[0],
            ...overrides
        };
    }

    static createLoginCredentials(overrides: Partial<LoginCredentials> = {}): LoginCredentials {
        return {
            username: 'Admin',
            password: 'admin123',
            ...overrides
        };
    }

    static createInvalidLoginCredentials(): LoginCredentials {
        return {
            username: 'InvalidUser',
            password: 'wrongpassword'
        };
    }

    static reset(): void {
        employeeCounter = 0;
        leaveCounter = 0;
    }
}
