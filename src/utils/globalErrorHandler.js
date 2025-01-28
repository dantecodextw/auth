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
    const str = new RegExp(`${error.meta.modelName}_(.*?)_`)
    const duplicateField = (error.meta.target).match(str)
    error.message = 'Data already exist',
        error.details = {
            [duplicateField[1]]: `${duplicateField[1]} already exist`
        }
    return new CustomError(error.message, 400, error.details)
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