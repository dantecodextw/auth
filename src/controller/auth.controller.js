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
    const validatedData = userValidation.signup.validate(req.body)

    // ===== SERVICE CALL =====
    // Pass validated data to service layer for business logic
    const newUser = await authService.signup(validatedData);

    // ===== RESPONSE =====
    // Send standardized success response with 201 Created status
    res.status(201).json(apiResponseHandler("Signup successful", newUser));
});

// Login controller with similar structure
const login = asyncErrorHandler(async (req, res) => {
    // Validate login credentials format

    // Will explain how not having validation helper class would result into writing customerror for each api
    // const { error, value } = userValidation.login.validate(req.body);
    // if (error) throw new CustomError(error.details[0].message, 400, error.details);

    const validatedData = userValidation.login.validate(req.body)

    // Authenticate user through service layer
    const user = await authService.login(validatedData);

    // Return success response with auth tokens/user data
    res.status(200).json(apiResponseHandler("Login successful", user));
});

// Export controllers as named methods
export default {
    signup,
    login
};