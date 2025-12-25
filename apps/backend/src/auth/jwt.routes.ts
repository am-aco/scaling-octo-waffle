import { Router } from "express";
import { JwtController } from "./jwt.controller.js";
import { JwtService } from "./jwt.service.js";
import { UserRepository } from "./user.repository.js";

export function createJwtRouter(): Router {
    const router = Router();

    const userRepository = new UserRepository();
    const jwtService = new JwtService(userRepository);
    const jwtController = new JwtController(jwtService);

    router.post("/login", jwtController.login);

    return router;
}
