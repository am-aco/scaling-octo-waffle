import {
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";
import { authApi } from "@/features/auth/api/auth.api";
import { csrfStore } from "@/services/api/csrf";
import type {
  AuthContextValue,
  AuthState,
  LoginCredentials,
  RegisterCredentials,
  User,
} from "@/features/auth/types/auth.types";
import { AuthContext } from "./auth-context-def";

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    csrfToken: null,
    isRememberMe: false,
};

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [state, setState] = useState<AuthState>(initialState);

    const setUser = (
        user: User | null,
        csrfToken: string | null = null,
        isRememberMe: boolean = false
    ) => {
        setState({
            user,
            isAuthenticated: !!user,
            isLoading: false,
            csrfToken,
            isRememberMe,
        });
    };

    const checkAuth = useCallback(async () => {
        try {
            setState((prev) => ({ ...prev, isLoading: true }));
            const response = await authApi.getProfile();
            csrfStore.setToken(response.csrfToken);
            setUser(response.user, response.csrfToken, response.isRememberMe);
        } catch {
            csrfStore.clearToken();
            setUser(null);
        }
    }, []);

    const login = async (credentials: LoginCredentials) => {
        const response = await authApi.login(credentials);
        csrfStore.setToken(response.csrfToken);
        setUser(response.user, response.csrfToken, response.isRememberMe);
        return response;
    };

    const register = async (credentials: RegisterCredentials) => {
        const response = await authApi.register(credentials);
        csrfStore.setToken(response.csrfToken);
        setUser(response.user, response.csrfToken, response.isRememberMe);
        return response;
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch (error) {
            // Ignore logout errors (e.g., if session is already invalid)
            console.error("Logout API call failed", error);
        } finally {
            csrfStore.clearToken();
            setUser(null);
        }
    };

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const value: AuthContextValue = {
        ...state,
        login,
        register,
        logout,
        checkAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
