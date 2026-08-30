/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RETRY HELPER - Custom Retry Logic
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Retry mechanisms for flaky operations with exponential backoff.
 * WHY: Network issues, race conditions, third-party services can be flaky.
 * IF NOT USED: Tests fail intermittently, developers lose trust in suite.
 * INTERVIEW TIP: "Exponential backoff prevents overwhelming failing services"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { logger } from './logger';

export interface RetryOptions {
    maxAttempts?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
    retryOn?: (error: Error) => boolean;
    onRetry?: (attempt: number, error: Error, delay: number) => void;
}

export interface RetryResult<T> {
    success: boolean;
    result?: T;
    attempts: number;
    errors: Error[];
    totalTime: number;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'retryOn' | 'onRetry'>> = {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
};

/**
 * Retry a function with exponential backoff
 *
 * INTERVIEW TIP: "Exponential backoff doubles wait time each retry,
 * preventing a cascade of requests to an already struggling service"
 *
 * @example
 * const result = await retry(
 *   () => apiClient.fetchData(),
 *   { maxAttempts: 3, initialDelay: 1000 }
 * );
 */
export async function retry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<RetryResult<T>> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const errors: Error[] = [];
    const startTime = Date.now();
    let delay = opts.initialDelay;

    for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
        try {
            logger.debug(`Retry attempt ${attempt}/${opts.maxAttempts}`);
            const result = await fn();

            return {
                success: true,
                result,
                attempts: attempt,
                errors,
                totalTime: Date.now() - startTime,
            };
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            errors.push(err);

            logger.warn(`Attempt ${attempt} failed: ${err.message}`);

            // Check if we should retry this specific error
            if (opts.retryOn && !opts.retryOn(err)) {
                logger.info('Error is not retryable, stopping');
                break;
            }

            // Don't wait after the last attempt
            if (attempt < opts.maxAttempts) {
                // Call onRetry callback if provided
                if (opts.onRetry) {
                    opts.onRetry(attempt, err, delay);
                }

                logger.debug(`Waiting ${delay}ms before next attempt`);
                await sleep(delay);

                // Calculate next delay with exponential backoff
                delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelay);
            }
        }
    }

    return {
        success: false,
        attempts: opts.maxAttempts,
        errors,
        totalTime: Date.now() - startTime,
    };
}

/**
 * Retry until condition is met (polling pattern)
 *
 * INTERVIEW TIP: "Poll pattern is useful for waiting on async operations
 * like database updates or queue processing"
 *
 * @example
 * await retryUntil(
 *   () => page.locator('.status').textContent(),
 *   (status) => status === 'Complete',
 *   { maxAttempts: 10, initialDelay: 500 }
 * );
 */
export async function retryUntil<T>(
    fn: () => Promise<T>,
    condition: (result: T) => boolean,
    options: RetryOptions = {}
): Promise<RetryResult<T>> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const errors: Error[] = [];
    const startTime = Date.now();
    let delay = opts.initialDelay;

    for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
        try {
            logger.debug(`Poll attempt ${attempt}/${opts.maxAttempts}`);
            const result = await fn();

            if (condition(result)) {
                return {
                    success: true,
                    result,
                    attempts: attempt,
                    errors,
                    totalTime: Date.now() - startTime,
                };
            }

            logger.debug('Condition not met, will retry');
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            errors.push(err);
            logger.warn(`Poll attempt ${attempt} failed: ${err.message}`);
        }

        if (attempt < opts.maxAttempts) {
            await sleep(delay);
            delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelay);
        }
    }

    return {
        success: false,
        attempts: opts.maxAttempts,
        errors,
        totalTime: Date.now() - startTime,
    };
}

/**
 * Circuit breaker pattern - stop retrying after too many failures
 *
 * INTERVIEW TIP: "Circuit breaker prevents wasting resources on
 * operations that are likely to fail"
 */
export class CircuitBreaker {
    private failures = 0;
    private lastFailure: number | null = null;
    private state: 'closed' | 'open' | 'half-open' = 'closed';

    constructor(
        private threshold: number = 5,
        private resetTimeout: number = 30000
    ) {}

    async execute<T>(fn: () => Promise<T>): Promise<T> {
        if (this.state === 'open') {
            if (Date.now() - (this.lastFailure || 0) > this.resetTimeout) {
                this.state = 'half-open';
                logger.info('Circuit breaker entering half-open state');
            } else {
                throw new Error('Circuit breaker is open');
            }
        }

        try {
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    private onSuccess(): void {
        this.failures = 0;
        this.state = 'closed';
    }

    private onFailure(): void {
        this.failures++;
        this.lastFailure = Date.now();

        if (this.failures >= this.threshold) {
            this.state = 'open';
            logger.warn(`Circuit breaker opened after ${this.failures} failures`);
        }
    }

    getState(): 'closed' | 'open' | 'half-open' {
        return this.state;
    }

    reset(): void {
        this.failures = 0;
        this.lastFailure = null;
        this.state = 'closed';
    }
}

/**
 * Sleep utility for delays
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Timeout wrapper - fail if operation takes too long
 *
 * INTERVIEW TIP: "Timeout prevents tests from hanging indefinitely"
 */
export async function withTimeout<T>(
    fn: () => Promise<T>,
    timeout: number,
    message = 'Operation timed out'
): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(message)), timeout);
    });

    return Promise.race([fn(), timeoutPromise]);
}

/**
 * Retry with jitter - adds randomness to prevent thundering herd
 *
 * INTERVIEW TIP: "Jitter prevents multiple clients from retrying
 * at the exact same time, which could overload the server"
 */
export function addJitter(delay: number, jitterPercent = 0.2): number {
    const jitter = delay * jitterPercent * (Math.random() * 2 - 1);
    return Math.max(0, delay + jitter);
}
