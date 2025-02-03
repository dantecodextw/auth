// ======== IMPORT DEPENDENCIES ========

// Built-in Libraries and Middleware
import express from "express";                   // Web framework for handling HTTP requests
import cors from "cors";                         // Middleware to enable Cross-Origin Resource Sharing
import helmet from "helmet";                     // Sets various HTTP headers for improved security
import compression from "compression";           // Compresses response bodies for better performance
import httpErrors from "http-errors";            // Creates standard HTTP error objects

// Custom Modules for Application Logic
import logger from "./src/utils/logger.js";      // Custom logger (replaces console.log)
import apiRouter from "./src/api/mainRouter.js";   // Router that contains API endpoints
import globalErrorHandler from "./src/utils/globalErrorHandler.js"; // Handles errors across the app
import requestId from "./src/middleware/requestId.js";  // Middleware to attach a unique ID to each request
import rateLimiter from "./src/utils/rateLimiter.js";     // Custom rate limiting configuration

// ======== ENVIRONMENT CONFIGURATION VALIDATION ========

// List of environment variables required for production
const requiredEnvVars = ['NODE_ENV', 'CORS_ORIGINS'];
if (process.env.NODE_ENV === 'production') {
    requiredEnvVars.forEach(varName => {
        if (!process.env[varName]) {
            logger.error(`Missing required environment variable: ${varName}`);
            process.exit(1); // Terminate the app if a required variable is missing
        }
    });
}

// ======== EXPRESS APPLICATION SETUP ========
const app = express();

// ======== SECURITY MIDDLEWARE ========

// Set security-related HTTP headers using Helmet
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"], // Consider tightening this for production use
            styleSrc: ["'self'", "'unsafe-inline'"]
        }
    }
}));

// Apply rate limiting to protect against excessive requests (e.g., 1000 requests per hour)
app.use(rateLimiter(1000, '1h'));

// Attach a unique ID to each request for easier tracking in logs
app.use(requestId);

// ======== PERFORMANCE MIDDLEWARE ========

// Compress response bodies to speed up the delivery of assets
app.use(compression());

// ======== BODY PARSING MIDDLEWARE ========

// Parse incoming JSON requests, limiting the size to 10kb to prevent abuse
app.use(express.json({ limit: '10kb' }));

// Parse URL-encoded data from requests, also with a 10kb size limit
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ======== CORS (CROSS-ORIGIN RESOURCE SHARING) CONFIGURATION ========

const corsOptions = {
    origin: process.env.CORS_ORIGINS?.split(',') || '*', // Allow specific origins if provided, otherwise allow all
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],    // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'],     // Allowed headers
    credentials: process.env.NODE_ENV === 'production',      // Enable credentials in production
    optionsSuccessStatus: 200                                // Use 200 for legacy browser support
};

// Enable CORS using the defined options
app.use(cors(corsOptions));

// ======== REQUEST LOGGING ========

// Log details of every incoming request, including method, URL, request ID, IP, and user agent
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.originalUrl}`, {
        requestId: req.requestId,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    next();
});

// ======== ROUTE HANDLERS ========

// API routes: all endpoints under '/api/v1' are handled by the apiRouter
app.use('/api/v1', apiRouter);

// Health Check: simple endpoint to verify that the server is running
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

// ======== ERROR HANDLING ========

// Handle all unmatched routes by creating a 404 Not Found error
app.use('*', (req, res, next) => {
    next(httpErrors.NotFound(`Resource not found: ${req.originalUrl}`));
});

// Use a global error handler to manage errors consistently
app.use(globalErrorHandler);

// ======== SERVER START-UP AND GRACEFUL SHUTDOWN ========

const PORT = process.env.PORT || 2000;
const server = app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Function to gracefully shut down the server upon receiving termination signals
const shutdown = (signal) => {
    logger.info(`${signal} received: Closing HTTP server`);
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
};

// Listen for termination signals to trigger graceful shutdown
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
