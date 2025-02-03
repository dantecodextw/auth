import * as argon2 from "argon2";
import prisma from "../../prisma/client/prismaClient.js";
import CustomError from "../utils/customErrorHandler.js";
import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";

// ================= SECURITY CONFIGURATIONS =================

// JWT settings for signing tokens. These include the signing algorithm, token expiration, and issuer information.
const JWT_CONFIG = {
    algorithm: 'HS256',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    issuer: process.env.JWT_ISSUER || 'our-app-name'
};

// Configuration settings for the Argon2id password hashing algorithm.
// These settings use 19MB of memory, perform 2 iterations, use a single thread, and generate a 32-byte hash.
// The chosen parameters balance strong security with acceptable performance.
const ARGON_CONFIG = {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
    hashLength: 32
};

// ================= HELPER FUNCTIONS =================

// Generates a JWT for the given user ID using the configured JWT settings.
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        JWT_CONFIG
    );
};

// ================= AUTHENTICATION SERVICES =================

// Signup service: hashes the user's password and creates a new user record in the database.
const signup = async (validatedData) => {
    // Hash the provided password using Argon2id with the specified configuration.
    const hashedPassword = await argon2.hash(validatedData.password, ARGON_CONFIG);

    // Create a new user record in the database with the hashed password.
    const newUser = await prisma.user.create({
        data: {
            ...validatedData,
            password: hashedPassword,
            password_changed_at: new Date()
        },
        // Only return selected fields (omit sensitive data like the password).
        select: { id: true, email: true, username: true, created_at: true }
    });

    // Log the successful creation of a new user.
    logger.info(`User created: ${newUser.email}`);

    // Return the new user data along with an access token for authentication.
    return {
        ...newUser,
        accessToken: generateToken(newUser.id)
    };
};

// Login service: verifies user credentials and returns user information with a new access token.
const login = async (validatedData) => {
    const { identifier, password } = validatedData;

    // Look up the user in the database by email or username (case-insensitive).
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { email: { equals: identifier, mode: 'insensitive' } },
                { username: { equals: identifier, mode: 'insensitive' } }
            ]
        },
        // Ensure the password field is included in the result.
        omit: { password: false }
    });

    // If no user is found or the password verification fails, log a warning and throw an error.
    if (!user || !(await argon2.verify(user.password, password))) {
        logger.warn(`Failed login attempt for: ${identifier}`);
        throw new CustomError("Invalid credentials", 401);
    }

    // Check if the user's account is deactivated. If so, log a warning and throw an error.
    if (!user.is_active) {
        logger.warn(`Login attempt for deactivated account: ${user.id}`);
        throw new CustomError("Account deactivated", 403);
    }

    // Update the user's last login time.
    await prisma.user.update({
        where: { id: user.id },
        data: { last_login: new Date() }
    });

    // Log the successful login of the user.
    logger.info(`User logged in: ${user.email}`);

    // Return the user data and a new access token.
    // The password field is explicitly set to undefined to avoid exposing it.
    return {
        user,
        accessToken: generateToken(user.id),
        password: undefined
    };
};

export default { signup, login };
