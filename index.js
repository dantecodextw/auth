// Core Dependencies
import express from "express";
import cors from "cors";
import helmet from "helmet"; // Added security headers
import rateLimit from "express-rate-limit"; // Added rate limiting
import compression from "compression"; // Added response compression
import logger from "./src/utils/logger.js"; // Custom logger instead of console.log
import httpErrors from "http-errors"; // Standard HTTP error objects

// Project Modules
import apiRouter from "./src/api/mainRouter.js";
import globalErrorHandler from "./src/utils/globalErrorHandler.js";

// Configuration Validation
const requiredEnvVars = ['NODE_ENV', 'CORS_ORIGINS'];
if (process.env.NODE_ENV === 'production') {
    requiredEnvVars.forEach(varName => {
        if (!process.env[varName]) {
            logger.error(`Missing required environment variable: ${varName}`);
            process.exit(1);
        }
    });
}

// Express Application Setup
const app = express();

// ================= SECURITY MIDDLEWARE =================
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"], // Tighten for production
            styleSrc: ["'self'", "'unsafe-inline'"]
        }
    }
}));

// Rate Limiting (adjust values based on requirements)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 1000,
    message: 'Too many requests from this IP, please try again later'
});

// ================= PERFORMANCE MIDDLEWARE =================
app.use(compression());

// ================= REQUEST PROCESSING =================
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// CORS Configuration
const corsOptions = {
    origin: process.env.CORS_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: process.env.NODE_ENV === 'production',
    optionsSuccessStatus: 200 // Legacy browser support
};

app.use(cors(corsOptions));

// ================= LOGGING MIDDLEWARE =================
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.originalUrl}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    next();
});

// ================= ROUTES =================
app.use('/api/v1', apiLimiter, apiRouter); // Apply rate limiting to API

// ================= HEALTH CHECK =================
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

// ================= ERROR HANDLING =================
// 404 Handler
app.use('*', (req, res, next) => {
    next(httpErrors.NotFound(`Resource not found: ${req.originalUrl}`));
});

// Global Error Handler
app.use(globalErrorHandler);

// ================= SERVER MANAGEMENT =================
const PORT = process.env.PORT || 2000;
const server = app.listen(PORT, () => {
    logger.info(`Server operational in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Graceful Shutdown
const shutdown = (signal) => {
    logger.info(`${signal} received: Closing HTTP server`);
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);