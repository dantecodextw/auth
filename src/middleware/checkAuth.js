import jwt from "jsonwebtoken";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import CustomError from "../utils/customErrorHandler.js";
import prisma from "../../prisma/client/prismaClient.js";

const checkAuth = asyncErrorHandler(async (req, res, next) => {
    const recievedToken = req.headers?.authorization?.split(' ')[1]

    if (!recievedToken) {
        throw new CustomError("You are not logged in", 401)
    }

    const { id } = jwt.verify(recievedToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) throw new CustomError(err.message, 401)
        return decoded
    })

    const user = await prisma.user.findUnique({
        where: { id }
    })

    if (!user) throw new CustomError("User does not exists", 401)

    req.user = user
    next()
})

export default checkAuth