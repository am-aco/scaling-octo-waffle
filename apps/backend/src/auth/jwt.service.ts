import { UserRepository } from "../users/user.repository.js";
import { signToken } from "./jwt.util.js";
import { verifyCredentials } from "./credential-verification.util.js";
import { withTransaction } from "../infrastructure/database.js";

export class JwtService {
    constructor(private userRepository: UserRepository) {}

    async login(email: string, password: string): Promise<{
        token: string;
        user: { id: string; email: string };
    }> {
        const user = await verifyCredentials(this.userRepository, email, password);

        const token = signToken(user.id, user.email);

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
