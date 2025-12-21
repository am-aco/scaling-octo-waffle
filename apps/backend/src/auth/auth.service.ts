import { UserRepository, type User } from "./user.repository.js";
import { hashPassword } from "./password.util.js";

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

        if (!this.isValidEmail(data.email)) {
            throw new Error("Invalid email format");
        }

        const existingUser = await this.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new Error("Email already registered");
        }

        if (!this.isValidPassword(data.password)) {
            throw new Error("Password must be at least 8 characters long");
        }

        const password_hash = await hashPassword(data.password);

        const user = await this.userRepository.create({
            email: data.email,
            password_hash,
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
