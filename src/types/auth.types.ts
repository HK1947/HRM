/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AUTHENTICATION TYPES
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT: Type definitions for authentication.
 * WHY: Consistent credential handling.
 * IF NOT USED: String typos in credential keys.
 * INTERVIEW TIP: "Interface for objects, Type for unions/primitives"
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface AuthState {
    isAuthenticated: boolean;
    username?: string;
    role?: 'Admin' | 'ESS' | 'Supervisor';
}

export interface StorageStateConfig {
    path: string;
    credentials: LoginCredentials;
}
