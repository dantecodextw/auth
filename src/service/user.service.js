// Import necessary modules
import * as argon2 from "argon2" // Import argon2 for hashing passwords
import prisma from "../../prisma/client/prismaClient.js" // Prisma client to interact with the database
import CustomError from "../utils/customErrorHandler.js" // Custom error class for handling application-specific errors

// Function to fetch the profile details of a user based on their user ID
const profileData = async (userID) => {
    // Fetch the user from the database using the provided user ID
    const user = await prisma.user.findUnique({
        where: { id: userID } // Find the user by their unique ID
    })

    // If user is not found, throw a custom error
    if (!user) throw new CustomError("Profile details can't be fetched", 400)

    // Return the user data without sensitive fields (password and deleted_at)
    return {
        ...user,
        deleted_at: undefined, // Remove the deleted_at field (for soft deletes)
    }
}

// Function to update a user's profile based on validated data
const updateProfile = async (validatedData, userID) => {
    // If the password is included in the validated data, hash it before updating
    if (validatedData.password) validatedData.password = await argon2.hash(validatedData.password)

    // Update the user's profile in the database using the provided data
    const updatedUser = await prisma.user.update({
        where: { id: userID }, // Find the user by their ID
        data: validatedData // Update the user's data with the provided validated data
    })

    // Return the updated user data
    return updatedUser
}

// Export the functions to be used in other parts of the application
export default {
    profileData,
    updateProfile
}
