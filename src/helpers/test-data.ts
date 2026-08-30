/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TEST DATA HELPER - Database Fixtures & Data Seeding
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Manage test data creation, seeding, and cleanup.
 * WHY: Tests need consistent, isolated data to be reliable.
 * IF NOT USED: Tests depend on existing data, become flaky.
 * INTERVIEW TIP: "Each test should create its own data and clean up after"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { APIRequestContext } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { logger } from './logger';

export interface TestEmployee {
    id?: string;
    firstName: string;
    lastName: string;
    employeeId: string;
    email?: string;
    jobTitle?: string;
    department?: string;
}

export interface TestUser {
    username: string;
    password: string;
    role: 'Admin' | 'ESS' | 'Supervisor';
    employeeId?: string;
}

export interface TestLeaveRequest {
    id?: string;
    employeeId: string;
    leaveType: string;
    fromDate: string;
    toDate: string;
    comment?: string;
}

/**
 * Test Data Manager - Handles data lifecycle
 *
 * INTERVIEW TIP: "This pattern ensures test isolation -
 * each test creates what it needs and cleans up after"
 */
export class TestDataManager {
    private request: APIRequestContext;
    private createdEmployees: string[] = [];
    private createdUsers: string[] = [];
    private createdLeaveRequests: string[] = [];
    private baseURL: string;

    constructor(request: APIRequestContext, baseURL: string) {
        this.request = request;
        this.baseURL = baseURL;
    }

    /**
     * Generate random employee data
     *
     * INTERVIEW TIP: "Faker generates realistic test data,
     * avoiding hardcoded values that can conflict"
     */
    generateEmployeeData(overrides: Partial<TestEmployee> = {}): TestEmployee {
        return {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            employeeId: faker.string.alphanumeric(6).toUpperCase(),
            email: faker.internet.email(),
            jobTitle: faker.person.jobTitle(),
            department: faker.commerce.department(),
            ...overrides,
        };
    }

    /**
     * Generate random user data
     */
    generateUserData(overrides: Partial<TestUser> = {}): TestUser {
        return {
            username: faker.internet.userName().slice(0, 20),
            password: faker.internet.password({ length: 12 }),
            role: 'ESS',
            ...overrides,
        };
    }

    /**
     * Generate random leave request data
     */
    generateLeaveData(employeeId: string, overrides: Partial<TestLeaveRequest> = {}): TestLeaveRequest {
        const fromDate = faker.date.future();
        const toDate = new Date(fromDate);
        toDate.setDate(toDate.getDate() + faker.number.int({ min: 1, max: 5 }));

        return {
            employeeId,
            leaveType: faker.helpers.arrayElement(['Annual Leave', 'Sick Leave', 'Personal Leave']),
            fromDate: fromDate.toISOString().split('T')[0],
            toDate: toDate.toISOString().split('T')[0],
            comment: faker.lorem.sentence(),
            ...overrides,
        };
    }

    /**
     * Create employee via API
     *
     * INTERVIEW TIP: "API seeding is faster than UI -
     * create test data via API, test UI flows"
     */
    async createEmployee(data?: Partial<TestEmployee>): Promise<TestEmployee> {
        const employeeData = this.generateEmployeeData(data);

        logger.info(`Creating test employee: ${employeeData.firstName} ${employeeData.lastName}`);

        try {
            const response = await this.request.post(`${this.baseURL}/api/v2/pim/employees`, {
                data: employeeData,
            });

            if (response.ok()) {
                const result = await response.json();
                employeeData.id = result.data?.empNumber || result.id;

                if (employeeData.id) {
                    this.createdEmployees.push(employeeData.id);
                }

                logger.info(`Created employee with ID: ${employeeData.id}`);
            }
        } catch (error) {
            logger.warn(`API employee creation failed, employee may need manual setup: ${error}`);
        }

        return employeeData;
    }

    /**
     * Create multiple employees
     */
    async createEmployees(count: number, template?: Partial<TestEmployee>): Promise<TestEmployee[]> {
        const employees: TestEmployee[] = [];

        for (let i = 0; i < count; i++) {
            const employee = await this.createEmployee(template);
            employees.push(employee);
        }

        return employees;
    }

    /**
     * Create user via API
     */
    async createUser(data?: Partial<TestUser>): Promise<TestUser> {
        const userData = this.generateUserData(data);

        logger.info(`Creating test user: ${userData.username}`);

        try {
            const response = await this.request.post(`${this.baseURL}/api/v2/admin/users`, {
                data: userData,
            });

            if (response.ok()) {
                this.createdUsers.push(userData.username);
                logger.info(`Created user: ${userData.username}`);
            }
        } catch (error) {
            logger.warn(`API user creation failed: ${error}`);
        }

        return userData;
    }

    /**
     * Create leave request via API
     */
    async createLeaveRequest(employeeId: string, data?: Partial<TestLeaveRequest>): Promise<TestLeaveRequest> {
        const leaveData = this.generateLeaveData(employeeId, data);

        logger.info(`Creating leave request for employee: ${employeeId}`);

        try {
            const response = await this.request.post(`${this.baseURL}/api/v2/leave/leave-requests`, {
                data: leaveData,
            });

            if (response.ok()) {
                const result = await response.json();
                leaveData.id = result.data?.id || result.id;

                if (leaveData.id) {
                    this.createdLeaveRequests.push(leaveData.id);
                }
            }
        } catch (error) {
            logger.warn(`API leave request creation failed: ${error}`);
        }

        return leaveData;
    }

    /**
     * Cleanup all created test data
     *
     * INTERVIEW TIP: "Always clean up test data in afterAll/afterEach
     * to prevent test pollution and data buildup"
     */
    async cleanup(): Promise<void> {
        logger.info('Cleaning up test data...');

        // Delete leave requests first (dependencies)
        for (const id of this.createdLeaveRequests) {
            try {
                await this.request.delete(`${this.baseURL}/api/v2/leave/leave-requests/${id}`);
                logger.debug(`Deleted leave request: ${id}`);
            } catch (error) {
                logger.warn(`Failed to delete leave request ${id}: ${error}`);
            }
        }

        // Delete users
        for (const username of this.createdUsers) {
            try {
                await this.request.delete(`${this.baseURL}/api/v2/admin/users`, {
                    data: { usernames: [username] },
                });
                logger.debug(`Deleted user: ${username}`);
            } catch (error) {
                logger.warn(`Failed to delete user ${username}: ${error}`);
            }
        }

        // Delete employees last
        for (const id of this.createdEmployees) {
            try {
                await this.request.delete(`${this.baseURL}/api/v2/pim/employees`, {
                    data: { ids: [id] },
                });
                logger.debug(`Deleted employee: ${id}`);
            } catch (error) {
                logger.warn(`Failed to delete employee ${id}: ${error}`);
            }
        }

        // Clear tracking arrays
        this.createdLeaveRequests = [];
        this.createdUsers = [];
        this.createdEmployees = [];

        logger.info('Test data cleanup complete');
    }

    /**
     * Get count of created resources
     */
    getCreatedCounts(): { employees: number; users: number; leaveRequests: number } {
        return {
            employees: this.createdEmployees.length,
            users: this.createdUsers.length,
            leaveRequests: this.createdLeaveRequests.length,
        };
    }
}

/**
 * Fixture-style test data factory
 *
 * INTERVIEW TIP: "Factory functions let you create variations
 * of test data with sensible defaults"
 */
export const testDataFactory = {
    employee: (overrides: Partial<TestEmployee> = {}): TestEmployee => ({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        employeeId: faker.string.alphanumeric(6).toUpperCase(),
        email: faker.internet.email(),
        jobTitle: faker.person.jobTitle(),
        department: faker.commerce.department(),
        ...overrides,
    }),

    user: (overrides: Partial<TestUser> = {}): TestUser => ({
        username: faker.internet.userName().slice(0, 20),
        password: faker.internet.password({ length: 12 }),
        role: 'ESS',
        ...overrides,
    }),

    adminUser: (overrides: Partial<TestUser> = {}): TestUser =>
        testDataFactory.user({ role: 'Admin', ...overrides }),

    validCredentials: (): { username: string; password: string } => ({
        username: 'Admin',
        password: 'admin123',
    }),

    invalidCredentials: (): { username: string; password: string } => ({
        username: faker.internet.userName(),
        password: faker.internet.password(),
    }),

    dateRange: (daysFromNow: number = 7, duration: number = 3): { from: string; to: string } => {
        const from = new Date();
        from.setDate(from.getDate() + daysFromNow);
        const to = new Date(from);
        to.setDate(to.getDate() + duration);

        return {
            from: from.toISOString().split('T')[0],
            to: to.toISOString().split('T')[0],
        };
    },
};

/**
 * Create TestDataManager instance
 */
export function createTestDataManager(request: APIRequestContext, baseURL: string): TestDataManager {
    return new TestDataManager(request, baseURL);
}
