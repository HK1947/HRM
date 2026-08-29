/**
 * ═══════════════════════════════════════════════════════════════════════════
 * API TYPES
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Generic API response types.
 * WHY: Type-safe API interactions.
 * IF NOT USED: Untyped API responses.
 * INTERVIEW TIP: "Generics allow one type to work with many data shapes"
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface APIResponse<T> {
    data: T;
    meta?: {
        total?: number;
        page?: number;
        limit?: number;
    };
    error?: {
        code: string;
        message: string;
    };
}

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestConfig {
    method: HTTPMethod;
    headers?: Record<string, string>;
    body?: unknown;
    timeout?: number;
}
