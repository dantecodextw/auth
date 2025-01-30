// Import the Joi library for schema validation
import joi from "joi";
import ValidationHelper from "../utils/validationHelper.js";

// Schema for validating profile update data
const updateProfile = new ValidationHelper({
    // First name: must be a string, at least 3 characters long, and can be empty (i.e., optional)
    first: joi.string().min(3).empty(''), // `min(3)` ensures at least 3 characters, `empty('')` allows the field to be optional (empty string is valid)

    // Last name: must be a string, at least 3 characters long, and can be empty (i.e., optional)
    last: joi.string().min(3).empty(''),

    // Phone number: must be a string, at least 10 characters long, and can be empty (i.e., optional)
    phone: joi.string().min(10).empty(''),

    // Username: must be a string, at least 3 characters long, and can be empty (i.e., optional)
    username: joi.string().min(3).empty(''),

    // Email: must be a valid email format, and can be empty (i.e., optional)
    email: joi.string().email().empty(''),

    // Password: must be a string, at least 6 characters long, and can be empty (i.e., optional)
    password: joi.string().min(6).empty('') // Allows the password field to be empty when updating other fields
})

// Export the schema for use in other parts of the application
export default {
    updateProfile
}
