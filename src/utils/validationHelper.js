import Joi from "joi";
import CustomError from "./customErrorHandler.js";

class ValidationHelper {
    constructor(validationSchema) {
        // Initialize Joi validation schema
        this.schema = Joi.object(validationSchema);
    }

    validate(requestData) {
        // Validate data with all errors reported
        const { error, value } = this.schema.validate(requestData, {
            abortEarly: false // Collect all validation errors
        });

        if (error) {
            const formattedErrors = this.formatValidationErrors(error.details);
            throw new CustomError("Validation failed", 400, formattedErrors);
        }

        return value;
    }

    formatValidationErrors(errorDetails) {
        return errorDetails.reduce((errorObject, currentError) => {
            const fieldName = currentError.context.label
            const errorMessage = this.formatErrorMessage(currentError);

            errorObject[fieldName] = errorMessage;
            return errorObject;
        }, {});
    }

    formatErrorMessage(errorDetail) {
        // Clean up Joi's default message format
        let message = errorDetail.message.replace(/"/g, '') // Remove all quotes

        // Capitalize first letter and ensure proper spacing
        return message.charAt(0).toUpperCase() + message.slice(1);
    }
}

export default ValidationHelper;