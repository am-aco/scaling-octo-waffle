import { UserRepository } from "../users/user.repository.js";
import { verifyPassword } from "./password.util.js";
import { signToken } from "./jwt.util.js";
import { AuthenticationError, ForbiddenError } from "./auth.errors.js";

export class JwtService {
    constructor(private userRepository: UserRepository) {}

    /* Authenticate user with email/password and return JWT */
    async login(email: string, password: string): Promise<{
        token: string;
        user: { id: string; email: string };
    }> {
        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw new AuthenticationError("Invalid credentials");
        }

        if (!user.is_active) {
            throw new ForbiddenError("Account is inactive");
        }

        const isPasswordValid = await verifyPassword(user.password_hash, password);

        if (!isPasswordValid) {
            throw new AuthenticationError("Invalid credentials");
        }

        /* Generate JWT token */
        const token = signToken(user.id, user.email);

        /* Update last login timestamp */
        await this.userRepository.updateLastLogin(user.id);

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
            },
        };
    }
}
