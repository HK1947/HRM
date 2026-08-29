/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LOGGER - Singleton Pattern
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Centralized logging with Winston.
 * WHY: Consistent logs across framework with levels and transports.
 * IF NOT USED: console.log scattered, no log levels, hard to debug CI.
 * INTERVIEW TIP: "Singleton ensures one logger instance - prevents log file conflicts"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import winston from 'winston';

const { combine, timestamp, printf, colorize, json } = winston.format;

const consoleFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});

let loggerInstance: winston.Logger | null = null;

function createLogger(): winston.Logger {
    if (loggerInstance) return loggerInstance;

    const isCI = process.env.CI === 'true';
    const logLevel = process.env.LOG_LEVEL || (isCI ? 'info' : 'debug');

    loggerInstance = winston.createLogger({
        level: logLevel,
        transports: [
            new winston.transports.Console({
                format: combine(
                    colorize(),
                    timestamp({ format: 'HH:mm:ss.SSS' }),
                    consoleFormat
                )
            }),
            new winston.transports.File({
                filename: 'logs/test-run.log',
                format: combine(timestamp(), json())
            }),
            new winston.transports.File({
                filename: 'logs/errors.log',
                level: 'error',
                format: combine(timestamp(), json())
            })
        ]
    });

    return loggerInstance;
}

export const logger = createLogger();

export function logTestStart(testName: string): void {
    logger.info(`▶ Starting: ${testName}`);
}

export function logTestEnd(testName: string, status: 'passed' | 'failed'): void {
    const icon = status === 'passed' ? '✓' : '✗';
    logger.info(`${icon} Finished: ${testName} - ${status.toUpperCase()}`);
}

export function logStep(step: string): void {
    logger.info(`  → ${step}`);
}
