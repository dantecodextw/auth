// Import core dependencies
import express from "express";
import cors from "cors";

// Import project-specific modules
import apiRouter from "./src/api/mainRouter.js"; // Centralized route configuration
import globalErrorHandler from "./src/utils/globalErrorHandler.js"; // Unified error response formatter

// Initialize Express application
const app = express();

// ================= MIDDLEWARE SETUP =================
// Body parser for incoming JSON payloads (limit set to 10kb by default)
app.use(express.json({ limit: '10kb' }));

// Enable CORS with production security considerations
app.use(cors({
    origin: process.env.CORS_ORIGINS?.split(',') || '*', // Allow comma-separated origins in production
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Explicit allowed methods
    credentials: process.env.NODE_ENV === 'prod' // Conditionally allow credentials
}));

// ================= ROUTE CONFIGURATION =================
// Versioned API endpoints with potential for future versions
app.use('/api/v1', apiRouter); // All v1 endpoints namespaced for clarity

// ================= ERROR HANDLING =================
// Handle undefined routes (Must be before globalErrorHandler)
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: "Resource not found",
        requestedUrl: req.originalUrl
    });
});

// Consolidated error handling (Last middleware in chain)
app.use(globalErrorHandler);

// ================= SERVER INITIALIZATION =================
const PORT = process.env.PORT ?? 2000;
const ENVIRONMENT = process.env.NODE_ENV || 'prod';

app.listen(PORT, () => {
    console.log(`Server operational on port ${PORT} (${ENVIRONMENT})`);
});