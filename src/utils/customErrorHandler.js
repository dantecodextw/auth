import staticData from "../config/staticData.js";

// CustomError extends the built-in Error class to include additional properties such as statusCode, details, and an operational flag.
class CustomError extends Error {
    /**
     * Constructs a new CustomError instance.
     * @param {string} message - The error message.
     * @param {number} statusCode - The HTTP status code associated with the error.
     * @param {any} details - Optional additional error details.
     */
    constructor(message, statusCode, details = null) {
        super(message);
        this.statusCode = statusCode;         // HTTP status code for the error.
        this.details = details;               // Additional error details.
        this.status = this.getStatus(statusCode); // Determine error status based on status code.
        this.isOperational = true;            // Flag to indicate this error is expected/handled.
        Error.captureStackTrace(this, this.constructor); // Capture stack trace excluding the constructor call.
    }

    /**
     * Maps the provided status code to a human-readable status.
     * @param {number} statusCode - The HTTP status code.
     * @returns {string} The corresponding status message.
     */
    getStatus(statusCode) {
        return staticData.httpStatusCodes[statusCode] || 'error';
    }

    /**
     * Sets additional error details.
     * @param {any} details - The error details to add.
     * @returns {CustomError} The updated CustomError instance.
     */
    setDetails(details) {
        this.details = details;
        return this;
    }
}

export default CustomError;
