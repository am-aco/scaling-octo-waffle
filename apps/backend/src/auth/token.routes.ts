import { Router } from "express";
import { TokenController } from "./token.controller.js";
import { TokenService } from "./token.service.js";
import { UserRepository } from "./user.repository.js";
import { RefreshTokenRepository } from "./refresh-token.repository.js";

export function createTokenRouter(): Router {
    const router = Router();

    const userRepository = new UserRepository();
    const refreshTokenRepository = new RefreshTokenRepository();
    const tokenService = new TokenService(userRepository, refreshTokenRepository);
    const tokenController = new TokenController(tokenService);

    router.post("/login", tokenController.login);
    router.post("/refresh", tokenController.refresh);
    router.post("/logout", tokenController.logout);

    return router;
}
