import express from "express";
import authController from "../controller/auth/auth.controller.js";

const apiRouter = express.Router()

apiRouter.route('/auth/signup').post(authController.signup)
// apiRouter.route('/auth/login').post(authController.login)

export default apiRouter