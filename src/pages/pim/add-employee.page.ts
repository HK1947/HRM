/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ADD EMPLOYEE PAGE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Form page for adding new employees.
 * WHY: Encapsulates employee creation workflow.
 * IF NOT USED: Form filling logic scattered.
 * INTERVIEW TIP: "Form pages often need special handling for validation states"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { ToastComponent } from '../components';
import { CreateEmployeePayload } from '../../types';
import { logStep } from '../../helpers';

export class AddEmployeePage extends BasePage {
    protected readonly pageUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/pim/addEmployee';
    protected readonly pageTitle = /OrangeHRM/;

    private readonly firstNameInput: Locator;
    private readonly middleNameInput: Locator;
    private readonly lastNameInput: Locator;
    private readonly employeeIdInput: Locator;
    private readonly saveButton: Locator;
    private readonly cancelButton: Locator;
    private readonly createLoginToggle: Locator;
    private readonly usernameInput: Locator;
    private readonly passwordInput: Locator;
    private readonly confirmPasswordInput: Locator;

    readonly toast: ToastComponent;

    constructor(page: Page) {
        super(page);
        this.firstNameInput = page.locator('input[name="firstName"]');
        this.middleNameInput = page.locator('input[name="middleName"]');
        this.lastNameInput = page.locator('input[name="lastName"]');
        this.employeeIdInput = page.locator('.oxd-grid-item:has-text("Employee Id") input');
        this.saveButton = page.locator('button[type="submit"]');
        this.cancelButton = page.locator('button:has-text("Cancel")');
        this.createLoginToggle = page.locator('.oxd-switch-input');
        this.usernameInput = page.locator('.oxd-grid-item:has-text("Username") input');
        this.passwordInput = page.locator('input[type="password"]').first();
        this.confirmPasswordInput = page.locator('input[type="password"]').nth(1);

        this.toast = new ToastComponent(page);
    }

    async fillEmployeeForm(employee: CreateEmployeePayload): Promise<void> {
        logStep(`Filling employee form: ${employee.firstName} ${employee.lastName}`);
        await this.fillInput(this.firstNameInput, employee.firstName);
        if (employee.middleName) {
            await this.fillInput(this.middleNameInput, employee.middleName);
        }
        await this.fillInput(this.lastNameInput, employee.lastName);
    }

    async setEmployeeId(employeeId: string): Promise<void> {
        logStep(`Setting employee ID: ${employeeId}`);
        await this.employeeIdInput.clear();
        await this.fillInput(this.employeeIdInput, employeeId);
    }

    async enableLoginDetails(): Promise<void> {
        logStep('Enabling login details');
        await this.createLoginToggle.click();
    }

    async fillLoginDetails(username: string, password: string): Promise<void> {
        logStep(`Filling login details for: ${username}`);
        await this.enableLoginDetails();
        await this.fillInput(this.usernameInput, username);
        await this.fillInput(this.passwordInput, password);
        await this.fillInput(this.confirmPasswordInput, password);
    }

    async save(): Promise<void> {
        logStep('Saving employee');
        await this.clickElement(this.saveButton);
    }

    async cancel(): Promise<void> {
        logStep('Cancelling employee creation');
        await this.clickElement(this.cancelButton);
    }

    async saveAndVerifySuccess(): Promise<void> {
        await this.save();
        await this.toast.verifySuccessMessage('Successfully Saved');
    }

    async createEmployee(employee: CreateEmployeePayload): Promise<void> {
        await this.fillEmployeeForm(employee);
        await this.saveAndVerifySuccess();
    }

    async getValidationError(): Promise<string> {
        const errorElement = this.page.locator('.oxd-input-field-error-message').first();
        if (await errorElement.isVisible()) {
            return await errorElement.innerText();
        }
        return '';
    }

    async verifyRequiredFieldError(): Promise<void> {
        const error = await this.getValidationError();
        expect(error).toBe('Required');
    }

    async clearForm(): Promise<void> {
        logStep('Clearing employee form');
        await this.firstNameInput.clear();
        await this.middleNameInput.clear();
        await this.lastNameInput.clear();
    }
}
