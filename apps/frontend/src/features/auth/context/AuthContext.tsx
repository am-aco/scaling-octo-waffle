import {
  createContext,
  useContext,
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

const AuthContext = createContext<AuthContextValue | null>(null);

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
      setUser(response.user, state.csrfToken);
    } catch {
      setUser(null);
    }
  }, [state.csrfToken]);

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

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
