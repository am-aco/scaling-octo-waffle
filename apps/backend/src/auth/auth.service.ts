import { UserRepository } from "./user.repository.js";
import { hashPassword } from "./password.util.js";
import { ValidationError, ConflictError } from "./auth.errors.js";

export interface RegisterData {
    email: string;
    password: string;
}

export interface RegisterResult {
    id: string;
    email: string;
    created_at: Date;
}

export class AuthService {
    constructor(private userRepository: UserRepository) { }

    async register(data: RegisterData): Promise<RegisterResult> {
        /* Validate all inputs before hitting the database */
        if (!this.isValidEmail(data.email)) {
            throw new ValidationError("Invalid email format");
        }

        if (!this.isValidPassword(data.password)) {
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

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    private isValidPassword(password: string): boolean {
        return password.length >= 8;
    }
}
