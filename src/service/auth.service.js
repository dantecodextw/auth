import * as argon2 from "argon2";
import prisma from "../../prisma/client/prismaClient.js";
import CustomError from "../utils/customErrorHandler.js";
import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";

// Security configurations
const JWT_CONFIG = {
    algorithm: 'HS256',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    issuer: process.env.JWT_ISSUER || 'our-app-name'
};


//These settings configure the Argon2id algorithm to use 19MB of memory, 
// perform 2 iterations, run on a single thread, and generate a 32-byte hash. 
// These values balance security and performance for password hashing.
const ARGON_CONFIG = {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
    hashLength: 32
};

const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        JWT_CONFIG
    );
};

const signup = async (validatedData) => {
    const hashedPassword = await argon2.hash(validatedData.password, ARGON_CONFIG);

    const newUser = await prisma.user.create({
        data: {
            ...validatedData,
            password: hashedPassword,
            password_changed_at: new Date()
        },
        select: { id: true, email: true, username: true, created_at: true }
    })

    logger.info(`User created: ${newUser.email}`);
    return {
        ...newUser,
        accessToken: generateToken(newUser.id)
    };
};

const login = async (validatedData) => {
    const { identifier, password } = validatedData;

    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { email: { equals: identifier, mode: 'insensitive' } },
                { username: { equals: identifier, mode: 'insensitive' } }
            ]
        },
        omit: { password: false }
    });

    if (!user || !(await argon2.verify(user.password, password))) {
        logger.warn(`Failed login attempt for: ${identifier}`);
        throw new CustomError("Invalid credentials", 401);
    }

    if (!user.is_active) {
        logger.warn(`Login attempt for deactivated account: ${user.id}`);
        throw new CustomError("Account deactivated", 403);
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { last_login: new Date() }
    })

    logger.info(`User logged in: ${user.email}`);
    return {
        user,
        accessToken: generateToken(user.id),
        password: undefined
    };
};

export default { signup, login };