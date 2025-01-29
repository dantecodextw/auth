import CustomError from "./customErrorHandler.js"

const devError = (error, res) => {
    res.status(error.statusCode).json({
        message: error.message,
        details: error.details ?? null,
        stackTrace: error.stack,
        error,
    })
}

const duplicateErrorHandler = (error) => {
    const duplicateField = error.meta.target[0];
    error.message = 'Data already exists';
    error.details = {
        [duplicateField]: `${duplicateField} already exists`
    };
    return new CustomError(error.message, 400, error.details);
}

const globalErrorHandler = (error, req, res, next) => {
    error.message = error.message ?? "Something went wrong"
    error.statusCode = error.statusCode ?? 500

    if (error.code === 'P2002') {
        error = duplicateErrorHandler(error)
    }

    if (process.env.ENVI === 'dev') {
        devError(error, res)
    }
}

export default globalErrorHandler