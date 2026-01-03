let csrfToken: string | null = null;

export const csrfStore = {
  getToken: (): string | null => csrfToken,
  setToken: (token: string | null): void => {
    csrfToken = token;
  },
  clearToken: (): void => {
    csrfToken = null;
  },
};
