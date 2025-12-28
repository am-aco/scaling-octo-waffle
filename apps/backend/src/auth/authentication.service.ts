import { UserRepository } from "../users/user.repository.js";
import { SessionRepository, type Session } from "./session.repository.js";
import { hashPassword } from "./password.util.js";
import { isValidEmail, isValidPassword } from "./validation.util.js";
import { ValidationError, ConflictError } from "../infrastructure/errors.js";
import { withTransaction } from "../infrastructure/database.js";
import { SESSION_DURATION_DAYS, REMEMBER_ME_DURATION_DAYS } from "./auth.constants.js";
import { verifyCredentials } from "./credential-verification.util.js";

export interface RegisterData {
    email: string;
    password: string;
}

export interface RegisterResult {
    id: string;
    email: string;
    created_at: Date;
}

export interface LoginData {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface LoginResult {
    session: Session;
    user: {
        id: string;
        email: string;
    };
}

export class AuthenticationService {
    constructor(
        private userRepository: UserRepository,
        private sessionRepository: SessionRepository
    ) { }

    async register(data: RegisterData): Promise<RegisterResult> {
        if (!isValidEmail(data.email)) {
            throw new ValidationError("Invalid email format");
        }

        if (!isValidPassword(data.password)) {
            throw new ValidationError("Password must be at least 8 characters long");
        }

        /* Check for existing user only after input validation passes */
        const existingUser = await this.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new ConflictError("Email already registered");
        }

        const passwordHash = await hashPassword(data.password);

        const user = await this.userRepository.create({
            email: data.email,
            password_hash: passwordHash,
        });

        return {
            id: user.id,
            email: user.email,
            created_at: user.created_at,
        };
    }

    async login(data: LoginData): Promise<LoginResult> {
        const user = await verifyCredentials(
            this.userRepository,
            data.email,
            data.password,
        );

        const isRememberMe = data.rememberMe === true;
        const sessionDuration = isRememberMe ? REMEMBER_ME_DURATION_DAYS : SESSION_DURATION_DAYS;

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + sessionDuration);

        const session = await withTransaction(async (client) => {
            await this.userRepository.resetFailedLoginAttempts(user.id, client);
            await this.userRepository.updateLastLogin(user.id, client);
            return await this.sessionRepository.create({
                user_id: user.id,
                expires_at: expiresAt,
                is_remember_me: isRememberMe,
            }, client);
        });

        return {
            session,
            user: {
                id: user.id,
                email: user.email,
            },
        };
    }

    async logout(sessionId: string): Promise<void> {
        await this.sessionRepository.deleteById(sessionId);
    }
}
