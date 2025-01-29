// Import core dependencies
import express from "express";

// Import route controllers (business logic handlers)
import authController from "../controller/auth.controller.js"; // Authentication-related operations
import userController from "../controller/user.controller.js"; // User profile operations

// Import middleware
import checkAuth from "../middleware/checkAuth.js"; // Authentication verification middleware

// Create main router instance
const apiRouter = express.Router();

// ================= PUBLIC ROUTES (No authentication required) =================
// Authentication endpoints
apiRouter.route('/auth/signup').post(authController.signup); // User registration
apiRouter.route('/auth/login').post(authController.login); // User login

// ================= AUTHENTICATION MIDDLEWARE =================
// All routes below this line require valid authentication token
apiRouter.use(checkAuth); // Validates JWT/session for protected routes

// ================= PROTECTED ROUTES (Require authentication) =================
// User profile management
apiRouter.route('/user/profile')
    .get(userController.profile) // GET user profile data
    .put(userController.updateProfile); // UPDATE user profile data

export default apiRouter;