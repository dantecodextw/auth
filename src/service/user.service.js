import prisma from "../../prisma/client/prismaClient.js"
import CustomError from "../utils/customErrorHandler.js"

const profileData = async (userID) => {
    const user = await prisma.user.findUnique({
        where: { id: userID }
    })

    if (!user) throw new CustomError("Profile details can't be fetched", 400)

    return {
        ...user,
        deleted_at: undefined,
        password: undefined
    }
}

const updateProfile = async (validatedData) => {
    // validatedData.password = validatedData.password ?
}

export default {
    profileData,
    updateProfile
}
