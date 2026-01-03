import { csrfStore } from "@/services/api/csrf";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const CSRF_HEADER = "X-CSRF-Token";
const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

interface RequestOptions extends RequestInit {
    params?: Record<string, string>;
}

interface ApiError {
    message?: string;
    statusCode?: number;
    error?: string;
    [key: string]: unknown;
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(
        endpoint: string,
        options: RequestOptions = {}
    ): Promise<T> {
        const { params, ...fetchOptions } = options;

        let url = `${this.baseUrl}${endpoint}`;

        if (params) {
            const searchParams = new URLSearchParams(params);
            url += `?${searchParams.toString()}`;
        }

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            ...(fetchOptions.headers as Record<string, string>),
        };

        const method = fetchOptions.method ?? "GET";
        if (!SAFE_METHODS.includes(method)) {
            const token = csrfStore.getToken();
            if (token) {
                headers[CSRF_HEADER] = token;
            }
        }

        const config: RequestInit = {
            ...fetchOptions,
            credentials: "include",
            headers,
        };

        const response = await fetch(url, config);

        if (!response.ok) {
            const errorData = (await response.json().catch(() => ({
                message: "An unexpected error occurred",
                statusCode: response.status,
            }))) as ApiError;

            const errorMessage = errorData.error || errorData.message || "Request failed";

            throw new ApiClientError(
                errorMessage,
                response.status,
                errorData
            );
        }

        if (response.status === 204) {
            return {} as T;
        }

        return response.json();
    }

    async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: "GET" });
    }

    async post<T>(
        endpoint: string,
        data?: unknown,
        options?: RequestOptions
    ): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: "POST",
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async put<T>(
        endpoint: string,
        data?: unknown,
        options?: RequestOptions
    ): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: "PUT",
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: "DELETE" });
    }
}

export class ApiClientError extends Error {
    statusCode: number;
    data: ApiError;

    constructor(message: string, statusCode: number, data: ApiError) {
        super(message);
        this.name = "ApiClientError";
        this.statusCode = statusCode;
        this.data = data;
    }
}

export const apiClient = new ApiClient(API_BASE_URL);
