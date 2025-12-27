import type { Router, RequestHandler } from "express";
import { Router as ExpressRouter } from "express";
import { TokenController } from "./token.controller.js";
import { TokenService } from "./token.service.js";
import type { UserRepository } from "../users/user.repository.js";
import type { RefreshTokenRepository } from "./refresh-token.repository.js";

interface TokenRouterDependencies {
    userRepository: UserRepository;
    refreshTokenRepository: RefreshTokenRepository;
    rateLimit?: RequestHandler;
}

export function createTokenRouter(deps: TokenRouterDependencies): Router {
    const router = ExpressRouter();

    const tokenService = new TokenService(deps.userRepository, deps.refreshTokenRepository);
    const tokenController = new TokenController(tokenService);

    const loginMiddleware = deps.rateLimit
        ? [deps.rateLimit, tokenController.login]
        : [tokenController.login];

    const refreshMiddleware = deps.rateLimit
        ? [deps.rateLimit, tokenController.refresh]
        : [tokenController.refresh];

    const logoutMiddleware = deps.rateLimit
        ? [deps.rateLimit, tokenController.logout]
        : [tokenController.logout];

    router.post("/login", ...loginMiddleware);
    router.post("/refresh", ...refreshMiddleware);
    router.post("/logout", ...logoutMiddleware);

    return router;
}
