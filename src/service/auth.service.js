import * as argon2 from "argon2"
import prisma from "../../prisma/client/prismaClient.js"
import CustomError from "../utils/customErrorHandler.js"
import jwt from "jsonwebtoken"
import asyncErrorHandler from "../utils/asyncErrorHandler.js"

const signup = async (validatedData) => {
    try {
        validatedData.password = await argon2.hash(validatedData.password)

        const newUser = await prisma.user.create({
            data: validatedData
        })
        console.log(newUser);


        if (!newUser) {
            throw new CustomError("Failed to create user", 400)
        }

        const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET)


        return {
            ...newUser,
            accessToken: token
        }

    } catch (error) {
        throw new CustomError('Some error', 400, error)
    }
}

export default {
    signup
}