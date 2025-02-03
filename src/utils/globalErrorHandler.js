// globalErrorHandler.js

import CustomError from "./customErrorHandler.js";
import logger from "./logger.js";
import { Prisma } from '@prisma/client';

// Map specific Prisma error codes to corresponding HTTP status codes.
const PRISMA_ERROR_MAP = {
    P2002: 409, // Unique constraint violation (duplicate entry)
    P2003: 409, // Foreign key constraint failure
    P2025: 404, // Record not found in the database
    P2016: 400, // Invalid data format provided
    P2021: 503, // Database table not found
    P2022: 503, // Database column not found
    P1017: 503, // Database connection was closed unexpectedly
};

const NODE_ENV = process.env.NODE_ENV || 'production';

// Function to parse and extract details from Prisma validation error messages.
const parseValidationError = (message) => {
    // Look for type mismatch errors, e.g., "Expected X, provided Y"
    const typeMismatchMatch = message.match(/Expected (.+?), provided (\w+)/);
    if (typeMismatchMatch) {
        return {
            expectedType: typeMismatchMatch[1],
            receivedType: typeMismatchMatch[2],
            message: `Expected ${typeMismatchMatch[1]} but received ${typeMismatchMatch[2]}`
        };
    }

    // Look for errors indicating an invalid value.
    const valueMatch = message.match(/Got invalid value (.+?) at/);
    if (valueMatch) {
        return {
            invalidValue: valueMatch[1].replace(/'/g, ''),
            message: `Invalid value format: ${valueMatch[1]}`
        };
    }

    // Look for errors with unknown or unexpected arguments.
    const fieldMatch = message.match(/Unknown argument `(\w+)`/);
    if (fieldMatch) {
        return {
            unknownField: fieldMatch[1],
            message: `Unexpected field: ${fieldMatch[1]}`
        };
    }

    // If none of the above match, return the original message.
    return { message: message };
};

// Function to handle and standardize Prisma errors.
const handlePrismaError = (error) => {
    // Handle known request errors from Prisma.
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const statusCode = PRISMA_ERROR_MAP[error.code] || 500;
        const errorMeta = error.meta || {};

        const messageMap = {
            P2002: `Conflict: ${errorMeta.target?.join(', ') || 'Field'} already exists`,
            P2025: errorMeta.modelName
                ? `${errorMeta.modelName} not found`
                : 'Resource not found',
            P2016: 'Missing required field',
        };

        return new CustomError(
            messageMap[error.code] || 'Database request error',
            statusCode,
            {
                prismaCode: error.code,
                // Include additional error meta only in development mode.
                ...(NODE_ENV === 'development' && { meta: error.meta })
            }
        );
    }

    // Handle Prisma validation errors by parsing the error message.
    if (error instanceof Prisma.PrismaClientValidationError) {
        const details = parseValidationError(error.message);
        return new CustomError(
            'Invalid request structure',
            400,
            { validation: details || error.message }
        );
    }

    // Handle errors occurring during Prisma initialization (e.g., connection issues).
    if (error instanceof Prisma.PrismaClientInitializationError) {
        logger.error('Prisma startup failed:', error);
        return new CustomError(
            'Database connection error',
            503,
            { code: 'DB_CONNECTION_FAILURE' }
        );
    }

    // Handle critical runtime errors from Prisma's engine.
    if (error instanceof Prisma.PrismaClientRustPanicError) {
        logger.fatal('Prisma engine crashed:', error);
        return new CustomError(
            'Database system error',
            500,
            { code: 'DB_ENGINE_FAILURE' }
        );
    }

    // If the error does not match any Prisma-specific type, return it unchanged.
    return error;
};

// Global error handler middleware for Express.
const globalErrorHandler = (error, req, res, next) => {
    // Set default status code and status if not already provided.
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';

    // Add request-specific context to the error.
    error.request = {
        method: req.method,
        path: req.path,
        timestamp: new Date().toISOString()
    };

    // Check if the error is related to Prisma by inspecting its constructor name.
    if (
        // Instead of checking for specific Prisma error types, we use the constructor name.
        error.constructor.name.startsWith('PrismaClient')
    ) {
        error = handlePrismaError(error);
    }

    // Log the error with structured details.
    logger.error({
        message: error.message,
        code: error.code || 'INTERNAL_ERROR',
        statusCode: error.statusCode,
        path: req.path,
        userId: req.user?.id,
        prismaCode: error.prismaCode,
        details: error.details,
        ...(NODE_ENV === 'development' && { stack: error.stack })
    });

    // Build the response object to be sent back to the client.
    const response = {
        success: false,
        status: error.status,
        message: error.message,
        ...(error.details && { details: error.details }),
        ...(NODE_ENV === 'development' && {
            stack: error.stack,
            prismaCode: error.prismaCode
        })
    };

    // In production, hide sensitive error details if the error is not operational.
    if (NODE_ENV === 'production') {
        if (!error.isOperational) {
            response.message = 'An unexpected error occurred';
            delete response.details;
        }
        delete response.prismaCode;
    }

    res.status(error.statusCode).json(response);
};

// Listen for uncaught exceptions and log them before exiting the process.
process.on('uncaughtException', (error) => {
    logger.fatal('Uncaught Exception:', error);
    process.exit(1);
});

// Listen for unhandled promise rejections and log them before exiting the process.
process.on('unhandledRejection', (reason) => {
    logger.fatal('Unhandled Rejection:', reason);
    process.exit(1);
});

export default globalErrorHandler;
