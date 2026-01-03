import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/features/auth/api/auth.api";
import { csrfStore } from "@/services/api/csrf";
import type {
    User,
    LoginCredentials,
    RegisterCredentials,
    LoginResponse,
    RegisterResponse,
    ProfileResponse
} from "@/features/auth/types/auth.types";

/* Query Keys */
export const authKeys = {
    all: ["auth"] as const,
    user: () => [...authKeys.all, "user"] as const,
};

/* Hook to fetch the current user */
export function useUser() {
    return useQuery({
        queryKey: authKeys.user(),
        queryFn: async (): Promise<ProfileResponse | null> => {
            try {
                const response = await authApi.getProfile();
                csrfStore.setToken(response.csrfToken);
                return response;
            } catch (error) {
                csrfStore.clearToken();
                return null;
            }
        },
        staleTime: 5 * 60 * 1000,
        retry: false,
    });
}

/* Hook to handle Login */
export function useLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
        onSuccess: (data: LoginResponse) => {
            /* Update the "user" query data immediately with the response */
            queryClient.setQueryData(authKeys.user(), {
                user: data.user,
                csrfToken: data.csrfToken,
                isRememberMe: data.isRememberMe
            });
            csrfStore.setToken(data.csrfToken);
        },
    });
}

/* Hook to handle Registration */
export function useRegister() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (credentials: RegisterCredentials) => authApi.register(credentials),
        onSuccess: (data: RegisterResponse) => {
            queryClient.setQueryData(authKeys.user(), {
                user: data.user,
                csrfToken: data.csrfToken,
                isRememberMe: data.isRememberMe
            });
            csrfStore.setToken(data.csrfToken);
        },
    });
}

/* Hook to handle Logout */
export function useLogout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => authApi.logout(),
        onSuccess: () => {
            /* Clear the user from cache */
            queryClient.setQueryData(authKeys.user(), null);
            csrfStore.clearToken();

            /* Optional: Invalidate all other queries that might depend on user */
            // queryClient.invalidateQueries(); 
        },
    });
}
