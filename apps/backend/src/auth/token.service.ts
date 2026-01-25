import { UserRepository } from "../users/user.repository.js";
import { RefreshTokenRepository } from "./refresh-token.repository.js";
import { signAccessToken } from "./jwt.util.js";
import { config } from "../infrastructure/config/config.js";
import { withTransaction } from "../infrastructure/database/database.js";
import { AuthenticationError, ForbiddenError, NotFoundError, ValidationError } from "../infrastructure/errors/errors.js";
import { verifyCredentials } from "./credential-verification.util.js";

export class TokenService {
    constructor(
        private userRepository: UserRepository,
        private refreshTokenRepository: RefreshTokenRepository
    ) {}

    async login(email: string, password: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: { id: string; email: string };
    }> {
        const user = await verifyCredentials(this.userRepository, email, password);

        const accessToken = signAccessToken(user.id, user.email);

        const tokenFamily = crypto.randomUUID();
        const expiresAt = this.calculateRefreshTokenExpiry();

        const refreshTokenRecord = await withTransaction(async (client) => {
            await this.userRepository.resetFailedLoginAttempts(user.id, client);
            await this.userRepository.updateLastLogin(user.id, client);

            return await this.refreshTokenRepository.create({
                user_id: user.id,
                token_family: tokenFamily,
                expires_at: expiresAt,
            }, client);
        });

        return {
            accessToken,
            refreshToken: refreshTokenRecord.id,
            user: {
                id: user.id,
                email: user.email,
            },
        };
    }

    /* Exchange refresh token for new access token */
    async refresh(refreshTokenId: string): Promise<{
        accessToken: string;
    }> {
        const refreshToken = await this.refreshTokenRepository.findById(refreshTokenId);

        if (!refreshToken) {
            throw new AuthenticationError("Invalid or expired refresh token");
        }

        /* Load user to generate new access token */
        const user = await this.userRepository.findById(refreshToken.user_id);

        if (!user) {
            throw new NotFoundError("User not found");
        }

        if (!user.is_active) {
            throw new ForbiddenError("Account is inactive");
        }

        /* Generate new access token */
        const accessToken = signAccessToken(user.id, user.email);

        return {
            accessToken,
        };
    }

    /* Logout by revoking refresh token */
    async logout(refreshTokenId: string): Promise<void> {
        await this.refreshTokenRepository.revoke(refreshTokenId);
    }

    /* Calculate refresh token expiration date */
    private calculateRefreshTokenExpiry(): Date {
        const expiresIn = config.jwt.refreshTokenExpiresIn;
        const now = new Date();

        /* Parse expiration string (e.g., "7d", "24h") */
        if (typeof expiresIn === "string") {
            const value = parseInt(expiresIn.slice(0, -1), 10);
            const unit = expiresIn.slice(-1);

            switch (unit) {
                case "d":
                    return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
                case "h":
                    return new Date(now.getTime() + value * 60 * 60 * 1000);
                case "m":
                    return new Date(now.getTime() + value * 60 * 1000);
                default:
                    throw new ValidationError(`Unsupported time unit: ${unit}`);
            }
        }

        /* If number, treat as milliseconds */
        return new Date(now.getTime() + (expiresIn as number));
    }
}
