import type { UserRepository, User } from "./user.repository.js";
import { hashPassword } from "../auth/password.util.js";
import { ValidationError, ConflictError } from "../auth/auth.errors.js";
import { isValidEmail, isValidPassword } from "../auth/validation.util.js";

export interface CreateUserData {
    email: string;
    password: string;
    role_id: string;
}

export interface UpdateUserData {
    email?: string | undefined;
    is_active?: boolean | undefined;
    role_id?: string | undefined;
}

export interface UserProfile {
    id: string;
    email: string;
    is_active: boolean;
    created_at: Date;
    last_login: Date | null;
    role: string;
}

export interface UserListItem {
    id: string;
    email: string;
    is_active: boolean;
    created_at: Date;
    role: string;
}

export class UserService {
    constructor(private userRepository: UserRepository) {}

    async getUserById(userId: string): Promise<UserProfile | null> {
        return await this.userRepository.findByIdWithRole(userId);
    }

    async getAllUsers(): Promise<UserListItem[]> {
        return await this.userRepository.findAllWithRoles();
    }

    async createUser(data: CreateUserData): Promise<User> {
        if (!isValidEmail(data.email)) {
            throw new ValidationError("Invalid email format");
        }

        if (!isValidPassword(data.password)) {
            throw new ValidationError("Password must be at least 8 characters");
        }

        const existingUser = await this.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new ConflictError("Email already registered");
        }

        const passwordHash = await hashPassword(data.password);

        return await this.userRepository.createWithRole({
            email: data.email,
            password_hash: passwordHash,
            role_id: data.role_id,
        });
    }

    async updateUser(userId: string, data: UpdateUserData): Promise<User | null> {
        if (data.email !== undefined && !isValidEmail(data.email)) {
            throw new ValidationError("Invalid email format");
        }

        if (data.email) {
            const existingUser = await this.userRepository.findByEmail(data.email);
            if (existingUser && existingUser.id !== userId) {
                throw new ConflictError("Email already in use");
            }
        }

        return await this.userRepository.update(userId, {
            email: data.email,
            is_active: data.is_active,
            role_id: data.role_id,
        });
    }

    async deleteUser(userId: string): Promise<boolean> {
        return await this.userRepository.deleteById(userId);
    }
}
