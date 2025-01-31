import jwt from "jsonwebtoken";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import CustomError from "../utils/customErrorHandler.js";
import prisma from "../../prisma/client/prismaClient.js";

// Security constants
const AUTH_SCHEME = "Bearer";
const TOKEN_REGEX = new RegExp(`^${AUTH_SCHEME}\\s+(?<token>[a-zA-Z0-9_-]+\\.[a-zA-Z0-9_-]+\\.[a-zA-Z0-9_-]+)$`);

const validateAuthorizationHeader = (header) => {
    if (!header) {
        throw new CustomError("Authentication required", 401);
    }

    const match = header.match(TOKEN_REGEX);

    if (!match?.groups?.token) {
        throw new CustomError(`Invalid authentication format. Use ${AUTH_SCHEME} schema`, 400);
    }

    return match.groups.token;
};

const checkAuth = asyncErrorHandler(async (req, res, next) => {
    // Validate and extract token
    const token = validateAuthorizationHeader(req.headers.authorization);

    // Verify JWT with security best practices
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ["HS256"], // Explicit algorithm whitelist
        issuer: process.env.JWT_ISSUER, // Validate issuer if configured
        ignoreExpiration: false, // Enforce expiration checks
    });

    // Validate token payload structure
    if (!decoded?.id || typeof decoded.id !== "number") {
        throw new CustomError("Invalid token payload", 401);
    }

    // Database lookup with security considerations
    const user = await prisma.user.findUnique({
        where: { id: decoded.id }
    });

    // Validate user status
    if (!user) throw new CustomError("User account not found", 401);
    if (!user.is_active) throw new CustomError("Account deactivated", 403);

    // Check if password was changed after token issuance
    if (user.password_changed_at > new Date(decoded.iat * 1000)) {
        throw new CustomError("Security credentials expired", 401);
    }

    // Attach user context to request
    req.user = user

    next();
});

export default checkAuth;