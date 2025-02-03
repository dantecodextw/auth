// Import dependencies
import authService from "../service/auth.service.js"; // Handles business logic for authentication
import apiResponseHandler from "../utils/apiResponseHandler.js"; // Formats standardized API responses
import asyncErrorHandler from "../utils/asyncErrorHandler.js"; // Wraps async functions to catch errors
import userValidation from "../validation/auth.validation.js"; // Joi schemas for validating authentication data

// Signup controller wrapped in async error handling middleware
const signup = asyncErrorHandler(async (req, res) => {
    // ===== VALIDATION PHASE =====
    // Validate request body using the signup schema
    const validatedData = userValidation.signup.validate(req.body);

    // ===== SERVICE CALL =====
    // Process the signup logic using the validated data through the service layer
    const newUser = await authService.signup(validatedData);

    // ===== RESPONSE =====
    // Return a 201 Created response with a standardized success message and the new user data
    res.status(201).json(apiResponseHandler("Signup successful", newUser));
});

// Login controller wrapped in async error handling middleware
const login = asyncErrorHandler(async (req, res) => {
    // ===== VALIDATION PHASE =====
    // Validate login credentials using the login schema
    // (Note: Without a validation helper, you would need to manually throw a CustomError for each failure)
    const validatedData = userValidation.login.validate(req.body);

    // ===== SERVICE CALL =====
    // Process login logic and authenticate the user via the service layer
    const user = await authService.login(validatedData);

    // ===== RESPONSE =====
    // Return a 200 OK response with a standardized success message and the authenticated user data
    res.status(200).json(apiResponseHandler("Login successful", user));
});

// Export the controllers as named properties for use in routing
export default {
    signup,
    login
};
