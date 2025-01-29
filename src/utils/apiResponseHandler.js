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





// Standardized API response handler to format the response structure consistently
const apiResponseHandler = (message = '', data = null, success = true) => {
    return {
        success, // Indicates whether the request was successful (true/false)
        message, // Custom message (e.g., "Operation successful" or error details)
        data // The data to be returned (can be null or any data related to the request)
    }
}

// Export the API response handler function to be used in other parts of the application
export default apiResponseHandler
