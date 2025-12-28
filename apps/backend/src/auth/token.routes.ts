import { Router, type RequestHandler } from "express";
import { TokenController } from "./token.controller.js";
import type { TokenService } from "./token.service.js";

interface TokenRouterDependencies {
    tokenService: TokenService;
    rateLimit?: RequestHandler;
}

export function createTokenRouter(deps: TokenRouterDependencies): Router {
    const router = Router();

    const tokenController = new TokenController(deps.tokenService);

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
