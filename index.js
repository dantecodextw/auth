// Import core dependencies
import express from "express";
import cors from "cors";

// Import project-specific modules
import apiRouter from "./src/api/mainRouter.js"; // Main API router containing all route definitions
import globalErrorHandler from "./src/utils/globalErrorHandler.js"; // Centralized error handling middleware

// Initialize Express application
const app = express();

// ================= MIDDLEWARE SETUP =================
// Parse incoming JSON requests (body-parser alternative)
app.use(express.json());

// Enable Cross-Origin Resource Sharing (CORS)
// Note: In production, you might want to configure allowed origins
app.use(cors());

// ================= ROUTE CONFIGURATION =================
// Mount API router under '/api/v1' base path
// All subsequent routes will be: /api/v1/[route-definitions-from-mainRouter]
app.use('/api/v1', apiRouter);

// ================= ERROR HANDLING =================
// Handle 404 - Catch-all for undefined routes
app.use('*', (req, res) => {
    res.status(404).json({
        status: false,
        message: "URL does not exist"
    });
});

// Global error handler - Must be last middleware in the chain
app.use(globalErrorHandler);

// ================= SERVER INITIALIZATION =================
// Start server on port 2000
const PORT = 2000;
app.listen(PORT, () => {
    console.log(`Server has been started on port ${PORT}`);
    // Note: In production, you might want to add a readiness check here
});