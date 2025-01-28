const asyncErrorHandler = (requestHandler) => {

    return (req, res, next) => {


        return requestHandler(req, res, next).catch(err => next(err))
    }
}

export default asyncErrorHandler