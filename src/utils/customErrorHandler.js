class CustomError extends Error {
    constructor(message, statusCode, details = null) {
        super(message),
            this.statusCode = statusCode,
            this.details = details,
            this.status = this.getStatus(statusCode),
            this.isOperational = true,
            Error.captureStackTrace(this, this.captureStackTrace)
    }

    getStatus(statusCode) {
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
        return httpStatusCodes[statusCode] ?? 'unavailable'
    }
}

export default CustomError