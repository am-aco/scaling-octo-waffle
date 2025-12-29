import argon2 from "argon2";
import { logger } from "../infrastructure/logger.js";

const ARGON2_OPTIONS = {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
};

/*
 * Hash a plain-text password using Argon2id
 * Returns a hash string that includes the salt and parameters
 */
export async function hashPassword(password: string): Promise<string> {
    return await argon2.hash(password, ARGON2_OPTIONS);
}

/*
 * Verify a plain-text password against an Argon2 hash
 * Returns true if password matches, false otherwise
 */
export async function verifyPassword(
    hash: string,
    password: string
): Promise<boolean> {
    try {
        return await argon2.verify(hash, password);
    }
    catch (error) {
        logger.error("Password verification failed", { error });
        return false;
    }
}
