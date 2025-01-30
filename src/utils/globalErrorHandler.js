// Import CustomError class for handling application-specific errors
import CustomError from "./customErrorHandler.js"

// Error handler for development environment (detailed error information is sent to the client)
const devError = (error, res) => {
    res.status(error.statusCode).json({
        success: false, // Response indicates failure
        status: error.status,
        message: error.message, // Send the error message
        details: error.details ?? null, // Include error details, if available
        stackTrace: error.stack, // Send the stack trace for debugging purposes (only in dev)
        error, // Include the entire error object for detailed inspection
    })
}

// Error handler for production environment (simplified error information is sent to the client)
const prodError = (error, res) => {
    // If the error is operational (planned application error), provide the message and details
    if (error.isOperational) {
        res.status(error.statusCode).json({
            success: false, // Response indicates failure
            status: error.status,
            message: error.message, // Send the error message
            details: error.details ?? undefined, // Include error details if available
        })
    } else {
        // If the error is not operational (system-level error), send a generic error message
        res.status(error.statusCode).json({
            success: false, // Response indicates failure
            status: error.status,
            message: "Something went wrong", // Provide a generic error message to avoid exposing internal details
        })
    }
}

// Handler for duplicate entry errors (typically for unique constraint violations in the database)
const duplicateErrorHandler = (error) => {
    // Get the field that caused the duplicate error (e.g., unique username or email)
    const duplicateField = error.meta.target[0];

    // Modify the error message to indicate a duplicate entry
    error.message = 'Data already exists';

    // Attach a more specific error detail for the duplicate field
    error.details = {
        [duplicateField]: `${duplicateField} already exists` // Indicate which field was duplicated
    };

    // Return a new CustomError object with the updated message and details
    return new CustomError(error.message, 400, error.details);
}

// Global error handler to catch all errors in the application (for both dev and prod environments)
const globalErrorHandler = (error, req, res, next) => {
    // Ensure the error has a message, defaulting to a generic message if not provided
    error.message = error.message ?? "Something went wrong";

    // Ensure the error has a status code, defaulting to 500 (Internal Server Error) if not provided
    error.statusCode = error.statusCode ?? 500;

    // If the error is related to a unique constraint violation (e.g., duplicate entry), handle it specifically
    if (error.code === 'P2002') {
        error = duplicateErrorHandler(error); // Handle duplicate errors with a custom message
    }

    // Depending on the environment (dev or prod), call the appropriate error handler
    if (process.env.NODE_ENV === 'dev') {
        devError(error, res); // Call development error handler (detailed error)
    }

    if (process.env.NODE_ENV === 'prod') {
        prodError(error, res); // Call production error handler (simplified error)
    }
}

// Export the global error handler to be used in the application
export default globalErrorHandler;
