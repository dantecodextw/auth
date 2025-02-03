import Joi from "joi";
import CustomError from "./customErrorHandler.js";

class ValidationHelper {
    constructor(validationSchema) {
        // Create a Joi validation schema using the provided validation rules.
        this.schema = Joi.object(validationSchema);
    }

    validate(requestData) {
        // Validate the request data using the schema.
        // The option 'abortEarly: false' ensures that all errors are collected.
        const { error, value } = this.schema.validate(requestData, {
            abortEarly: false // Report all validation errors, not just the first one.
        });

        // If validation errors exist, format them and throw a custom error.
        if (error) {
            const formattedErrors = this.formatValidationErrors(error.details);
            throw new CustomError("Validation failed", 400, formattedErrors);
        }

        // Return the validated and sanitized data.
        return value;
    }

    formatValidationErrors(errorDetails) {
        // Transform the array of Joi error details into a structured error object.
        return errorDetails.reduce((errorObject, currentError) => {
            const fieldName = currentError.context.label; // Field that failed validation
            const errorMessage = this.formatErrorMessage(currentError); // Clean up the error message

            errorObject[fieldName] = errorMessage;
            return errorObject;
        }, {});
    }

    formatErrorMessage(errorDetail) {
        // Remove unnecessary quotes from Joi's default error message.
        let message = errorDetail.message.replace(/"/g, '');

        // Capitalize the first letter for consistency and clarity.
        return message.charAt(0).toUpperCase() + message.slice(1);
    }
}

export default ValidationHelper;
