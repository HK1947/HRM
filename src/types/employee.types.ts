/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EMPLOYEE TYPES
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Type definitions for Employee entity.
 * WHY: Type safety for all employee operations.
 * IF NOT USED: Runtime errors, no IDE support.
 * INTERVIEW TIP: "Omit<T,K> creates type without specified keys - use for CREATE payloads"
 * ═══════════════════════════════════════════════════════════════════════════
 */

export enum EmployeeStatus {
    ACTIVE = 'Active',
    INACTIVE = 'Inactive',
    TERMINATED = 'Terminated'
}

export type EmploymentType = 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern';

export interface Employee {
    employeeId: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    email?: string;
    status: EmployeeStatus;
    employmentType?: EmploymentType;
    jobTitle?: string;
    department?: string;
}

export type CreateEmployeePayload = Omit<Employee, 'employeeId' | 'status'>;
export type UpdateEmployeePayload = Partial<Omit<Employee, 'employeeId'>>;

export interface EmployeeSearchCriteria {
    name?: string;
    employeeId?: string;
    status?: EmployeeStatus;
}
