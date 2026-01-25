/* Base class for all application errors */
export class AppError extends Error {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

/* Input validation failed (400 Bad Request) */
export class ValidationError extends AppError {}

/* Resource already exists (409 Conflict) */
export class ConflictError extends AppError {}

/* Authentication failed - invalid credentials (401 Unauthorized) */
export class AuthenticationError extends AppError {}

/* Resource not found (404 Not Found) */
export class NotFoundError extends AppError {}

/* User lacks permission (403 Forbidden) */
export class ForbiddenError extends AppError {}
