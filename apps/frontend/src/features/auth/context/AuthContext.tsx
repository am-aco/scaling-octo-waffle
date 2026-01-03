import {
  createContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { authApi } from "../api/auth.api";
import { csrfStore } from "@/services/api/csrf";
import type {
  AuthContextValue,
  AuthState,
  LoginCredentials,
  RegisterCredentials,
  User,
} from "../types/auth.types";

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  csrfToken: null,
};

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(initialState);

  const setUser = (user: User | null, csrfToken: string | null = null) => {
    setState({
      user,
      isAuthenticated: !!user,
      isLoading: false,
      csrfToken,
    });
  };

  const checkAuth = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const response = await authApi.getProfile();
      csrfStore.setToken(response.csrfToken);
      setUser(response.user, response.csrfToken);
    } catch {
      csrfStore.clearToken();
      setUser(null);
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials);
    csrfStore.setToken(response.csrfToken);
    setUser(response.user, response.csrfToken);
  };

  const register = async (credentials: RegisterCredentials) => {
    const response = await authApi.register(credentials);
    csrfStore.setToken(response.csrfToken);
    setUser(response.user, response.csrfToken);
  };

  const logout = async () => {
    await authApi.logout();
    csrfStore.clearToken();
    setUser(null);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
