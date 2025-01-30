import staticData from "../config/staticData.js";

class CustomError extends Error {
    constructor(message, statusCode, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.status = this.getStatus(statusCode);
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }

    getStatus(statusCode) {
        return staticData.httpStatusCodes[statusCode] || 'error';
    }

    setDetails(details) {
        this.details = details;
        return this;
    }
}

export default CustomError;