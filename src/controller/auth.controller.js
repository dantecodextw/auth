import prisma from "../../prisma/client/prismaClient.js";
import authService from "../service/auth.service.js";
import apiResponseHandler from "../utils/apiResponseHandler.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import CustomError from "../utils/customErrorHandler.js";
import userValidation from "../validation/auth.validation.js";

const signup = asyncErrorHandler(async (req, res) => {
    const { error, value } = userValidation.signup.validate(req.body)
    if (error) throw new CustomError(error.details[0].message, 400, error.details)

    const newUser = await authService.signup(value)

    res.status(201).json(apiResponseHandler("Signup successfull", newUser))
})

const login = asyncErrorHandler(async (req, res) => {
    const { error, value } = userValidation.login.validate(req.body)
    if (error) throw new CustomError(error.details[0].message, 400, error.details)

    const user = await authService.login(value)

    res.status(200).json(apiResponseHandler("Login successfull", user))
})

export default {
    signup,
    login
}