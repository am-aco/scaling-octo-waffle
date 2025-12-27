import { UserRepository } from "../users/user.repository.js";
import { verifyPassword } from "./password.util.js";
import { signToken } from "./jwt.util.js";
import { AuthenticationError, ForbiddenError } from "./auth.errors.js";
import { withTransaction } from "../infrastructure/database.js";
import { MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION_MS } from "./auth.constants.js";

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

        const now = new Date();

        if (user.locked_until && user.locked_until > now) {
            const minutesRemaining = Math.ceil((user.locked_until.getTime() - now.getTime()) / 60000);
            throw new ForbiddenError(
                `Account is temporarily locked due to too many failed login attempts. Try again in ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}.`
            );
        }

        if (user.locked_until && user.locked_until <= now) {
            await this.userRepository.resetFailedLoginAttempts(user.id);
        }

        const isPasswordValid = await verifyPassword(user.password_hash, password);

        if (!isPasswordValid) {
            await withTransaction(async (client) => {
                await this.userRepository.incrementFailedLoginAttempts(user.id, client);

                const updatedUser = await this.userRepository.findById(user.id);
                if (updatedUser && updatedUser.failed_login_attempts >= MAX_LOGIN_ATTEMPTS) {
                    const lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
                    await this.userRepository.lockAccount(user.id, lockedUntil, client);
                }
            });

            throw new AuthenticationError("Invalid credentials");
        }

        /* Generate JWT token */
        const token = signToken(user.id, user.email);

        /* Update last login and reset failed attempts */
        await withTransaction(async (client) => {
            await this.userRepository.resetFailedLoginAttempts(user.id, client);
            await this.userRepository.updateLastLogin(user.id, client);
        });

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
            },
        };
    }
}
