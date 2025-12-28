import { UserRepository } from "../users/user.repository.js";
import { signToken } from "./jwt.util.js";
import { verifyCredentials, recordSuccessfulLogin } from "./credential-verification.util.js";

export class JwtService {
    constructor(private userRepository: UserRepository) {}

    async login(email: string, password: string): Promise<{
        token: string;
        user: { id: string; email: string };
    }> {
        const user = await verifyCredentials(this.userRepository, email, password);

        const token = signToken(user.id, user.email);

        await recordSuccessfulLogin(this.userRepository, user.id);

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
            },
        };
    }
}
