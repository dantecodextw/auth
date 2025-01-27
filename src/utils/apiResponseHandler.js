// import CustomErrorHandler from "./customErrorHandler.js"

// class ApiResponseHandler extends CustomErrorHandler {
//     constructor(message, statusCode, data = null) {
//         super(message),
//             this.statusCode = statusCode,
//             this.status = this.getStatus(statusCode),
//             this.data = data ?? null
//     }

//     sendResponse(res) {
//         res.status(this.statusCode).json({
//             success: true,
//             status: this.status,
//             message: this.message,
//             data: this.data
//         })
//     }
// }

// export default ApiResponseHandler

const apiResponseHandler = (message = '', data = null, success = true) => {
    return {
        success,
        message,
        data
    }
}

export default apiResponseHandler