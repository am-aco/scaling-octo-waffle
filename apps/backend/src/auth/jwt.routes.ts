import type { Router, RequestHandler } from "express";
import { Router as ExpressRouter } from "express";
import { JwtController } from "./jwt.controller.js";
import { JwtService } from "./jwt.service.js";
import type { UserRepository } from "../users/user.repository.js";

interface JwtRouterDependencies {
    userRepository: UserRepository;
    rateLimit?: RequestHandler;
}

export function createJwtRouter(deps: JwtRouterDependencies): Router {
    const router = ExpressRouter();

    const jwtService = new JwtService(deps.userRepository);
    const jwtController = new JwtController(jwtService);

    const loginMiddleware = deps.rateLimit
        ? [deps.rateLimit, jwtController.login]
        : [jwtController.login];

    router.post("/login", ...loginMiddleware);

    return router;
}
