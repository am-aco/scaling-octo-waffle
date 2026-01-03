export interface User {
    id: string;
    email: string;
    emailVerified?: boolean;
    permissions?: string[];
    created_at?: string;
    updated_at?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface RegisterCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: User;
    message: string;
    csrfToken: string;
    isRememberMe: boolean;
}

export interface RegisterResponse {
    user: User;
    message: string;
    csrfToken: string;
    isRememberMe: boolean;
}

export interface ProfileResponse {
    user: User;
    csrfToken: string;
    isRememberMe: boolean;
}

export interface PasswordResetRequestPayload {
    email: string;
}

export interface PasswordResetPayload {
    token: string;
    newPassword: string;
}

export interface MessageResponse {
    message: string;
}

export interface TokenValidationPayload {
    token: string;
}

export interface TokenValidationResponse {
    valid: boolean;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    csrfToken: string | null;
    isRememberMe: boolean;
}

export interface AuthContextValue extends AuthState {
    login: (credentials: LoginCredentials) => Promise<LoginResponse>;
    register: (credentials: RegisterCredentials) => Promise<RegisterResponse>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}
