// Import core dependencies
import express from "express";

// Import route controllers (business logic handlers)
import authController from "../controller/auth.controller.js"; // Handles authentication operations
import userController from "../controller/user.controller.js"; // Manages user profile actions

// Import middleware functions
import checkAuth from "../middleware/checkAuth.js"; // Verifies user authentication (JWT/session)
import rateLimiter from "../utils/rateLimiter.js"; // Limits the number of requests to prevent abuse

// Create an Express router instance for API routes
const apiRouter = express.Router();

// ================= PUBLIC ROUTES (No authentication required) =================

// Authentication endpoints (publicly accessible)
// Rate-limited signup endpoint for new user registration
apiRouter.route('/auth/signup').post(rateLimiter(10, '15min'), authController.signup);
// Rate-limited login endpoint for user authentication
apiRouter.route('/auth/login').post(rateLimiter(5, '10min'), authController.login);

// ================= APPLY AUTHENTICATION MIDDLEWARE =================
// All routes defined after this point require a valid authentication token.
apiRouter.use(checkAuth); // Middleware that validates JWT/session for protected routes

// ================= PROTECTED ROUTES (Require authentication) =================

// User profile management endpoints
apiRouter.route('/user/profile')
    .get(userController.profile)       // Retrieve the authenticated user's profile data
    .put(userController.updateProfile); // Update the authenticated user's profile information

export default apiRouter;
