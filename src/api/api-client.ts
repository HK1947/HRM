/**
 * ═══════════════════════════════════════════════════════════════════════════
 * API CLIENT - Playwright Request API Wrapper
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Centralized API client for HTTP requests.
 * WHY: Reusable request methods with logging and error handling.
 * IF NOT USED: Duplicated request logic across API tests.
 * INTERVIEW TIP: "API clients abstract HTTP details from tests"
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { APIRequestContext, APIResponse } from '@playwright/test';
import { logger } from '../helpers';

export interface APIClientConfig {
    baseURL: string;
    defaultHeaders?: Record<string, string>;
}

export class APIClient {
    private request: APIRequestContext;
    private baseURL: string;
    private defaultHeaders: Record<string, string>;

    constructor(request: APIRequestContext, config: APIClientConfig) {
        this.request = request;
        this.baseURL = config.baseURL;
        this.defaultHeaders = config.defaultHeaders || {
            'Content-Type': 'application/json'
        };
    }

    private getFullUrl(endpoint: string): string {
        return `${this.baseURL}${endpoint}`;
    }

    async get<T>(endpoint: string, options?: { headers?: Record<string, string> }): Promise<{
        status: number;
        data: T;
        response: APIResponse;
    }> {
        const url = this.getFullUrl(endpoint);
        logger.info(`GET ${url}`);

        const response = await this.request.get(url, {
            headers: { ...this.defaultHeaders, ...options?.headers }
        });

        const data = await response.json() as T;
        logger.info(`Response: ${response.status()}`);

        return {
            status: response.status(),
            data,
            response
        };
    }

    async post<T>(endpoint: string, body: unknown, options?: { headers?: Record<string, string> }): Promise<{
        status: number;
        data: T;
        response: APIResponse;
    }> {
        const url = this.getFullUrl(endpoint);
        logger.info(`POST ${url}`);

        const response = await this.request.post(url, {
            headers: { ...this.defaultHeaders, ...options?.headers },
            data: body
        });

        const data = await response.json() as T;
        logger.info(`Response: ${response.status()}`);

        return {
            status: response.status(),
            data,
            response
        };
    }

    async put<T>(endpoint: string, body: unknown, options?: { headers?: Record<string, string> }): Promise<{
        status: number;
        data: T;
        response: APIResponse;
    }> {
        const url = this.getFullUrl(endpoint);
        logger.info(`PUT ${url}`);

        const response = await this.request.put(url, {
            headers: { ...this.defaultHeaders, ...options?.headers },
            data: body
        });

        const data = await response.json() as T;
        logger.info(`Response: ${response.status()}`);

        return {
            status: response.status(),
            data,
            response
        };
    }

    async delete(endpoint: string, options?: { headers?: Record<string, string> }): Promise<{
        status: number;
        response: APIResponse;
    }> {
        const url = this.getFullUrl(endpoint);
        logger.info(`DELETE ${url}`);

        const response = await this.request.delete(url, {
            headers: { ...this.defaultHeaders, ...options?.headers }
        });

        logger.info(`Response: ${response.status()}`);

        return {
            status: response.status(),
            response
        };
    }

    async patch<T>(endpoint: string, body: unknown, options?: { headers?: Record<string, string> }): Promise<{
        status: number;
        data: T;
        response: APIResponse;
    }> {
        const url = this.getFullUrl(endpoint);
        logger.info(`PATCH ${url}`);

        const response = await this.request.patch(url, {
            headers: { ...this.defaultHeaders, ...options?.headers },
            data: body
        });

        const data = await response.json() as T;
        logger.info(`Response: ${response.status()}`);

        return {
            status: response.status(),
            data,
            response
        };
    }
}
