// Async error handler middleware to catch errors in asynchronous code
const asyncErrorHandler = (requestHandler) => {

    // Return a new middleware function
    return (req, res, next) => {

        // Call the original request handler, and catch any asynchronous errors
        return requestHandler(req, res, next)
            .catch(err => next(err)) // If an error occurs, pass it to the next middleware (error handler)
    }
}

export default asyncErrorHandler // Export the middleware for use in other parts of the application
