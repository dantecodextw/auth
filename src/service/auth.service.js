import * as argon2 from "argon2"
import prisma from "../../prisma/client/prismaClient.js"
import CustomError from "../utils/customErrorHandler.js"
import jwt from "jsonwebtoken"

const generateToken = (userID) => {
    return jwt.sign({ id: userID }, process.env.JWT_SECRET, { expiresIn: "1h" })
}

const signup = async (validatedData) => {
    validatedData.password = await argon2.hash(validatedData.password)

    const newUser = await prisma.user.create({
        data: validatedData
    })

    if (!newUser) throw new CustomError("Failed to create user", 400)

    return {
        ...newUser,
        password: undefined,
    }

}

const login = async (validatedData) => {
    const { identifier, password } = validatedData

    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { username: identifier },
                { email: identifier }
            ]
        }
    })

    if (!user || !(await argon2.verify(user.password, password))) {
        throw new CustomError("Invalid login credentials", 401)
    }

    const token = generateToken(user.id)

    return {
        ...user,
        password: undefined,
        accessToken: token
    }

}

export default {
    signup,
    login
}