import { toast } from "sonner";
import { ApiClientError } from "@/services/api/client";

/**
 * Centrally handles API errors by showing a toast notification.
 * Falls back to a generic message for unknown errors.
 */
export const handleApiError = (error: unknown, toastId?: string) => {
    let message = "An unexpected error occurred. Please try again.";

    if (error instanceof ApiClientError) {
        message = error.message;
    } else if (error instanceof Error) {
        message = error.message;
    }

    toast.error(message, {
        id: toastId,
    });

    return message;
};
