import type { UserRepository, User } from "../users/user.repository.js";
import { verifyPassword } from "./password.util.js";
import { withTransaction } from "../infrastructure/database.js";
import { AuthenticationError, ForbiddenError } from "../infrastructure/errors.js";
import { MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION_MS } from "./auth.constants.js";

export interface VerifiedUser {
    id: string;
    email: string;
}

export async function verifyCredentials(
    userRepository: UserRepository,
    email: string,
    password: string,
): Promise<VerifiedUser> {
    const user = await userRepository.findByEmail(email);

    if (!user) {
        throw new AuthenticationError("Invalid email or password");
    }

    await checkAccountState(user);

    const now = new Date();
    if (user.locked_until && user.locked_until <= now) {
        await userRepository.resetFailedLoginAttempts(user.id);
    }

    const isPasswordValid = await verifyPassword(user.password_hash, password);

    if (!isPasswordValid) {
        await handleFailedLogin(userRepository, user);
        throw new AuthenticationError("Invalid email or password");
    }

    return {
        id: user.id,
        email: user.email,
    };
}

function checkAccountState(user: User): void {
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
}

async function handleFailedLogin(
    userRepository: UserRepository,
    user: User,
): Promise<void> {
    await withTransaction(async (client) => {
        await userRepository.incrementFailedLoginAttempts(user.id, client);

        const updatedUser = await userRepository.findById(user.id);
        if (updatedUser && updatedUser.failed_login_attempts >= MAX_LOGIN_ATTEMPTS) {
            const lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
            await userRepository.lockAccount(user.id, lockedUntil, client);
        }
    });
}
