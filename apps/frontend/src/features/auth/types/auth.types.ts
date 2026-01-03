export interface User {
  id: string;
  email: string;
  emailVerified?: boolean;
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
}

export interface RegisterResponse {
  user: User;
  message: string;
  csrfToken: string;
}

export interface ProfileResponse {
  user: User;
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

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  csrfToken: string | null;
}

export interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}
