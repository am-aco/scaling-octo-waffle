import { apiClient } from "@/services/api/client";
import type {
  LoginCredentials,
  LoginResponse,
  RegisterCredentials,
  RegisterResponse,
  ProfileResponse,
  PasswordResetRequestPayload,
  PasswordResetPayload,
  MessageResponse,
  TokenValidationPayload,
  TokenValidationResponse,
} from "@/features/auth/types/auth.types";

export const authApi = {
  login: (credentials: LoginCredentials): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>("/auth/login", credentials);
  },

  register: (credentials: RegisterCredentials): Promise<RegisterResponse> => {
    return apiClient.post<RegisterResponse>("/auth/register", credentials);
  },

  logout: (): Promise<MessageResponse> => {
    return apiClient.post<MessageResponse>("/auth/logout");
  },

  getProfile: (): Promise<ProfileResponse> => {
    return apiClient.get<ProfileResponse>("/auth/profile");
  },

  requestPasswordReset: (
    payload: PasswordResetRequestPayload
  ): Promise<MessageResponse> => {
    return apiClient.post<MessageResponse>(
      "/auth/password-reset/request",
      payload
    );
  },

  resetPassword: (payload: PasswordResetPayload): Promise<MessageResponse> => {
    return apiClient.post<MessageResponse>("/auth/password-reset/reset", payload);
  },

  validateResetToken: (payload: TokenValidationPayload): Promise<TokenValidationResponse> => {
    return apiClient.post<TokenValidationResponse>("/auth/password-reset/validate", payload);
  },
};
