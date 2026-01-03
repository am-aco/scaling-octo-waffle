import {
    type ReactNode,
    useCallback,
    useMemo,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUser, useLogin, useRegister, useLogout, authKeys } from "../hooks/auth-queries";
import type {
    AuthContextValue,
    LoginCredentials,
    RegisterCredentials,
} from "@/features/auth/types/auth.types";
import { AuthContext } from "./auth-context-def";

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const queryClient = useQueryClient();

    /* Use React Query hooks */
    const { data: profileData, isLoading: isUserLoading } = useUser();
    const loginMutation = useLogin();
    const registerMutation = useRegister();
    const logoutMutation = useLogout();

    const user = profileData?.user ?? null;
    const isAuthenticated = !!user;
    const csrfToken = profileData?.csrfToken ?? null;
    const isRememberMe = profileData?.isRememberMe ?? false;

    const login = async (credentials: LoginCredentials) => {
        return await loginMutation.mutateAsync(credentials);
    };

    const register = async (credentials: RegisterCredentials) => {
        return await registerMutation.mutateAsync(credentials);
    };

    const logout = async () => {
        await logoutMutation.mutateAsync();
    };

    const checkAuth = useCallback(async () => {
        await queryClient.invalidateQueries({ queryKey: authKeys.user() });
    }, [queryClient]);

    const value: AuthContextValue = useMemo(() => ({
        user,
        isAuthenticated,
        isLoading: isUserLoading,
        csrfToken,
        isRememberMe,
        login,
        register,
        logout,
        checkAuth,
    }), [user, isAuthenticated, isUserLoading, csrfToken, isRememberMe, checkAuth, loginMutation, registerMutation, logoutMutation]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
