import prisma from "../../prisma/client/prismaClient.js";
import apiResponseHandler from "../utils/apiResponseHandler.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import CustomErrorHandler from "../utils/customErrorHandler.js";
import userValidation from "../validation/user.validation.js";

const signup = asyncErrorHandler(async (req, res) => {
    const { error, value } = userValidation.signup.validate(req.body)

    if (error) {
        throw new CustomErrorHandler(error.details[0].message, 400, error.details)
    }

    const newUser = await prisma.user.create({
        data: { value }
    })
    console.log(newUser);

    res.status(201).json(apiResponseHandler("User has been created", newUser))

})

export default {
    signup
}