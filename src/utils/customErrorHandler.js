// Custom error class to handle application-specific errors with additional details
class CustomError extends Error {
    constructor(message, statusCode, details = null) {
        // Call the parent Error constructor with the message
        super(message);

        // Set the custom properties for the error
        this.statusCode = statusCode; // HTTP status code for the error
        this.details = details; // Additional details (e.g., validation errors)
        this.status = this.getStatus(statusCode); // Human-readable status (e.g., "Bad Request")
        this.isOperational = true; // Flag to indicate if the error is operational (vs system-level)

        // Capture the stack trace for debugging purposes
        Error.captureStackTrace(this, this.captureStackTrace);
    }

    // Method to return the human-readable status based on the HTTP status code
    getStatus(statusCode) {
        // Map of common HTTP status codes to their human-readable status
        const httpStatusCodes = {
            200: "OK",
            201: "Created",
            204: "No Content",
            400: "Bad Request",
            401: "Unauthorized",
            403: "Forbidden",
            404: "Not Found",
            405: "Method Not Allowed",
            500: "Internal Server Error",
            502: "Bad Gateway",
            503: "Service Unavailable",
            504: "Gateway Timeout"
        }

        // Return the status text or 'unavailable' if the code is not in the map
        return httpStatusCodes[statusCode] ?? 'unavailable';
    }
}

// Export the CustomError class to be used in other parts of the application
export default CustomError;
