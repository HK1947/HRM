/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LEAVE TYPES
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Type definitions for Leave management.
 * WHY: Type safety for leave workflows.
 * IF NOT USED: Inconsistent leave data handling.
 * INTERVIEW TIP: "Enums provide both type safety and runtime values"
 * ═══════════════════════════════════════════════════════════════════════════
 */

export enum LeaveType {
    ANNUAL = 'Annual Leave',
    SICK = 'Sick Leave',
    MATERNITY = 'Maternity Leave',
    UNPAID = 'Unpaid Leave'
}

export enum LeaveStatus {
    PENDING = 'Pending',
    APPROVED = 'Approved',
    REJECTED = 'Rejected',
    CANCELLED = 'Cancelled'
}

export interface LeaveRequest {
    id?: string;
    employeeId: string;
    leaveType: LeaveType;
    fromDate: string;
    toDate: string;
    comments?: string;
    status: LeaveStatus;
}

export type ApplyLeavePayload = Omit<LeaveRequest, 'id' | 'status'>;
