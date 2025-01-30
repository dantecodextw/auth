// globalErrorHandler.js
import CustomError from "./customErrorHandler.js";
import logger from "./logger.js";
import { Prisma } from '@prisma/client';

// Map Prisma error codes to HTTP status codes
const PRISMA_ERROR_MAP = {
    P2002: 409, // Unique constraint violation
    P2003: 409, // Foreign key constraint
    P2025: 404, // Record not found
    P2016: 400, // Invalid data format
    P2021: 503, // Database table not found
    P2022: 503, // Database column not found
    P1017: 503, // Database connection closed
};

const NODE_ENV = process.env.NODE_ENV || 'production';

const parseValidationError = (message) => {
    const fieldMatch = message.match(/Unknown argument `(\w+)`/);
    const valueMatch = message.match(/Got invalid value '(.+?)'/);
    const typeMatch = message.match(/Expected (\w+), provided/);

    const details = {};
    if (fieldMatch) details.field = fieldMatch[1];
    if (valueMatch) details.invalidValue = valueMatch[1];
    if (typeMatch) details.expectedType = typeMatch[1];

    return Object.keys(details).length ? details : null;
};

const handlePrismaError = (error) => {
    // Handle known request errors
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
                ...(NODE_ENV === 'development' && { meta: error.meta })
            }
        );
    }

    // Handle validation errors
    if (error instanceof Prisma.PrismaClientValidationError) {
        const details = parseValidationError(error.message);
        return new CustomError(
            'Invalid request structure',
            400,
            { validation: details }
        );
    }

    // Handle initialization errors
    if (error instanceof Prisma.PrismaClientInitializationError) {
        logger.error('Prisma startup failed:', error);
        return new CustomError(
            'Database connection error',
            503,
            { code: 'DB_CONNECTION_FAILURE' }
        );
    }

    // Handle runtime engine crashes
    if (error instanceof Prisma.PrismaClientRustPanicError) {
        logger.fatal('Prisma engine crashed:', error);
        return new CustomError(
            'Database system error',
            500,
            { code: 'DB_ENGINE_FAILURE' }
        );
    }

    return error;
};

const globalErrorHandler = (error, req, res, next) => {
    // Standardize error properties
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';

    // Add request context
    error.request = {
        method: req.method,
        path: req.path,
        timestamp: new Date().toISOString()
    };

    // Handle Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError ||
        error instanceof Prisma.PrismaClientValidationError ||
        error instanceof Prisma.PrismaClientInitializationError ||
        error instanceof Prisma.PrismaClientRustPanicError) {
        error = handlePrismaError(error);
    }

    // Structured logging
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

    // Construct response
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

    // Production security cleanup
    if (NODE_ENV === 'production') {
        if (!error.isOperational) {
            response.message = 'An unexpected error occurred';
            delete response.details;
        }
        delete response.prismaCode;
    }

    res.status(error.statusCode).json(response);
};

// Handle uncaught exceptions/rejections
process.on('uncaughtException', (error) => {
    logger.fatal('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    logger.fatal('Unhandled Rejection:', reason);
    process.exit(1);
});

export default globalErrorHandler;