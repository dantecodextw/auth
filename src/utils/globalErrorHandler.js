import CustomError from "./customErrorHandler.js"

const devError = (error, res) => {
    res.status(error.statusCode).json({
        success: false,
        message: error.message,
        details: error.details ?? null,
        stackTrace: error.stack,
        error,
    })
}

const prodError = (error, res) => {

    if (error.isOperational) {
        res.status(error.statusCode).json({
            success: false,
            message: error.message,
            details: error.details ?? null,

        })
    } else {
        res.status(error.statusCode).json({
            success: false,
            message: "Something went wrong",
        })
    }

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

    if (process.env.ENVI === 'prod') {
        prodError(error, res)
    }
}

export default globalErrorHandler