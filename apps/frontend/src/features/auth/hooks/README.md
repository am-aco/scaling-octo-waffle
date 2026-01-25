# Auth Hooks (React Query)

This directory contains React Query hooks for authentication.

## `useUser`
Fetches the current authenticated user profile.
- **Key:** `['auth', 'user']`
- **Stale Time:** 5 minutes (data is considered fresh for 5 mins)
- **Retry:** False (don't retry on 401/403)

## `useLogin`
Mutation hook for user login.
- Updates the `['auth', 'user']` query data on success (optimistic update).
- Sets CSRF token.

## `useRegister`
Mutation hook for user registration.
- Updates the `['auth', 'user']` query data on success.
- Sets CSRF token.

## `useLogout`
Mutation hook for user logout.
- Clears the `['auth', 'user']` query data on success.
- Clears CSRF token.
