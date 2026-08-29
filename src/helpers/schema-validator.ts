/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SCHEMA VALIDATOR - AJV JSON Schema Validation
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Validates API responses against JSON schemas.
 * WHY: Catch API contract violations early in tests.
 * IF NOT USED: Invalid API responses go undetected, tests pass with bad data.
 * INTERVIEW TIP: "JSON Schema validation catches contract drift between frontend and backend"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import Ajv, { ValidateFunction, ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync } from 'fs';
import { join } from 'path';
import { logger } from './logger';

export class SchemaValidationError extends Error {
    constructor(
        public schemaName: string,
        public errors: ErrorObject[]
    ) {
        const errorMessages = errors
            .map(e => `${e.instancePath} ${e.message}`)
            .join('; ');
        super(`Schema validation failed for ${schemaName}: ${errorMessages}`);
        this.name = 'SchemaValidationError';
    }
}

export class SchemaValidator {
    private ajv: Ajv;
    private validators: Map<string, ValidateFunction> = new Map();
    private schemaDir: string;

    constructor(schemaDir?: string) {
        this.ajv = new Ajv({ allErrors: true, strict: false });
        addFormats(this.ajv);
        this.schemaDir = schemaDir || join(process.cwd(), 'data', 'schemas');
    }

    loadSchema(schemaName: string): ValidateFunction {
        if (this.validators.has(schemaName)) {
            return this.validators.get(schemaName)!;
        }

        const schemaPath = join(this.schemaDir, `${schemaName}.schema.json`);
        const schemaContent = readFileSync(schemaPath, 'utf-8');
        const schema = JSON.parse(schemaContent);

        const validate = this.ajv.compile(schema);
        this.validators.set(schemaName, validate);
        logger.debug(`Loaded schema: ${schemaName}`);

        return validate;
    }

    validate<T>(schemaName: string, data: unknown): T {
        const validate = this.loadSchema(schemaName);
        const valid = validate(data);

        if (!valid && validate.errors) {
            logger.error(`Schema validation failed: ${schemaName}`);
            throw new SchemaValidationError(schemaName, validate.errors);
        }

        logger.debug(`Schema validation passed: ${schemaName}`);
        return data as T;
    }

    isValid(schemaName: string, data: unknown): boolean {
        try {
            this.validate(schemaName, data);
            return true;
        } catch {
            return false;
        }
    }

    getValidationErrors(schemaName: string, data: unknown): ErrorObject[] | null {
        const validate = this.loadSchema(schemaName);
        validate(data);
        return validate.errors || null;
    }
}

export const schemaValidator = new SchemaValidator();
