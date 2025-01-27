const devError = (error, res) => {
    res.status(error.statusCode).json({
        message: error.message,
        details: error.details ?? null,
        stackTrace: error.stack,
        error,
    })
}

const globalErrorHandler = (error, req, res, next) => {
    error.message = error.message ?? "Something went wrong"

    if (error.isOperational) {
        devError(error, res)
    }
}

export default globalErrorHandler