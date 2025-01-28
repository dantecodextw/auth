import express from "express";
import authController from "../controller/auth.controller.js";
import checkAuth from "../middleware/checkAuth.js";
import userController from "../controller/user.controller.js";

const apiRouter = express.Router()

apiRouter.route('/auth/signup').post(authController.signup)
apiRouter.route('/auth/login').post(authController.login)

apiRouter.use(checkAuth) // Global middleware

apiRouter.route('/user/profile')
    .get(userController.profile)
    .put(userController.updateProfile)

export default apiRouter