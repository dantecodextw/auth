// Import dependencies
import prisma from "../../prisma/client/prismaClient.js"; // Database client
import authService from "../service/auth.service.js"; // Business logic layer
import apiResponseHandler from "../utils/apiResponseHandler.js"; // Standardized response formatter
import asyncErrorHandler from "../utils/asyncErrorHandler.js"; // Error handling wrapper
import CustomError from "../utils/customErrorHandler.js"; // Custom error class
import userValidation from "../validation/auth.validation.js"; // Joi validation schemas

// Signup controller wrapped in error handling middleware
const signup = asyncErrorHandler(async (req, res) => {
    // ===== VALIDATION PHASE =====
    // Validate request body against Joi schema
    const { error, value } = userValidation.signup.validate(req.body);

    // Throw custom error if validation fails
    if (error) throw new CustomError(
        error.details[0].message, // Human-readable error
        400, // HTTP status code
        error.details // Original validation details for debugging
    );

    // ===== SERVICE CALL =====
    // Pass validated data to service layer for business logic
    const newUser = await authService.signup(value);

    // ===== RESPONSE =====
    // Send standardized success response with 201 Created status
    res.status(201).json(apiResponseHandler("Signup successful", newUser));
});

// Login controller with similar structure
const login = asyncErrorHandler(async (req, res) => {
    // Validate login credentials format
    const { error, value } = userValidation.login.validate(req.body);
    if (error) throw new CustomError(error.details[0].message, 400, error.details);

    // Authenticate user through service layer
    const user = await authService.login(value);

    // Return success response with auth tokens/user data
    res.status(200).json(apiResponseHandler("Login successful", user));
});

// Export controllers as named methods
export default {
    signup,
    login
};