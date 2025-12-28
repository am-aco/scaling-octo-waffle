import { Router, type RequestHandler } from "express";
import { JwtController } from "./jwt.controller.js";
import type { JwtService } from "./jwt.service.js";

interface JwtRouterDependencies {
    jwtService: JwtService;
    rateLimit?: RequestHandler;
}

export function createJwtRouter(deps: JwtRouterDependencies): Router {
    const router = Router();

    const jwtController = new JwtController(deps.jwtService);

    const loginMiddleware = deps.rateLimit
        ? [deps.rateLimit, jwtController.login]
        : [jwtController.login];

    router.post("/login", ...loginMiddleware);

    return router;
}
