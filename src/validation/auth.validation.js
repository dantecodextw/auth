// Import Joi for schema validation (used to validate data formats)
import joi from 'joi';

// ================= SIGNUP VALIDATION SCHEMA =================
const signup = joi.object({
    // First name: Must be a string with a minimum length of 3 characters, and it is required
    first: joi.string().min(3).required(),

    // Last name: Must be a string with a minimum length of 3 characters, and it is required
    last: joi.string().min(3).required(),

    // Phone number: Must be a string with a minimum length of 10 characters, and it is required
    phone: joi.string().min(10).required(),

    // Username: Must be a string with a minimum length of 3 characters, and it is required
    username: joi.string().min(3).required(),

    // Email: Must be a valid email format and is required
    email: joi.string().email().required(),

    // Password: Must be a string with a minimum length of 6 characters, and it is required
    password: joi.string().min(6).required()
});

// ================= LOGIN VALIDATION SCHEMA =================
const login = joi.object({
    // Identifier: Can be either a username or email, must be a string with a minimum length of 3 characters, and is required
    identifier: joi.string().min(3).required(),

    // Password: Must be a string with a minimum length of 6 characters, and it is required
    password: joi.string().min(6).required()
});

// Export the validation schemas so they can be used in other parts of the application
export default {
    signup,
    login
};
