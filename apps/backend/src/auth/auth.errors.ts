/* Base class for all auth-related errors */
export class AuthError extends Error {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class ValidationError extends AuthError { }
export class ConflictError extends AuthError { }
