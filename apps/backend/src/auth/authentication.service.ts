import { UserRepository } from "./user.repository.js";
import { SessionRepository, type Session } from "./session.repository.js";
import { hashPassword, verifyPassword } from "./password.util.js";
import { isValidEmail, isValidPassword } from "./validation.util.js";
import { ValidationError, ConflictError } from "./auth.errors.js";
import { withTransaction } from "../infrastructure/database.js";
import { SESSION_DURATION_DAYS } from "./auth.constants.js";

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
        const user = await this.userRepository.findByEmail(data.email);
        if (!user) {
            throw new ValidationError("Invalid email or password");
        }

        const isValidPassword = await verifyPassword(user.password_hash, data.password);
        if (!isValidPassword) {
            throw new ValidationError("Invalid email or password");
        }

        if (!user.is_active) {
            throw new ValidationError("Account is inactive");
        }

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

        const session = await withTransaction(async (client) => {
            await this.userRepository.updateLastLogin(user.id, client);
            return await this.sessionRepository.create(user.id, expiresAt, client);
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
        await this.sessionRepository.delete(sessionId);
    }
}
