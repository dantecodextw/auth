// Import necessary modules
import * as argon2 from "argon2"; // For secure password hashing using the Argon2 algorithm
import prisma from "../../prisma/client/prismaClient.js"; // Prisma client for database interactions
import CustomError from "../utils/customErrorHandler.js"; // Custom error class for application-specific error handling

// ================= ARGON2 CONFIGURATION =================
// These settings configure the Argon2id algorithm with the following parameters:
// - memoryCost: Uses 19MB of memory.
// - timeCost: Performs 2 iterations.
// - parallelism: Uses a single thread.
// - hashLength: Generates a 32-byte hash.
// These values are chosen to provide a balance between security and performance.
const ARGON_CONFIG = {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
    hashLength: 32
};

// ================= USER PROFILE SERVICES =================

/**
 * Fetches the profile details for a user given their unique ID.
 * @param {string} userID - The unique identifier of the user.
 * @returns {Object} The user's profile data, excluding sensitive fields.
 * @throws {CustomError} If no user is found with the provided ID.
 */
const profileData = async (userID) => {
    // Retrieve the user record from the database using their unique ID.
    const user = await prisma.user.findUnique({
        where: { id: userID } // Locate the user by their unique identifier.
    });

    // If no user is found, throw a custom error.
    if (!user) throw new CustomError("Profile details can't be fetched", 400);

    // Return the user data while omitting sensitive or irrelevant fields.
    return {
        ...user,
        deleted_at: undefined, // Exclude the 'deleted_at' field (used for soft deletes).
    };
};

/**
 * Updates a user's profile using validated data.
 * @param {Object} validatedData - The data that has been validated and sanitized.
 * @param {string} userID - The unique identifier of the user.
 * @returns {Object} The updated user record.
 */
const updateProfile = async (validatedData, userID) => {
    // If the password is part of the update, hash it using Argon2 before saving.
    if (validatedData.password) {
        validatedData.password = await argon2.hash(validatedData.password, ARGON_CONFIG);
        validatedData.password_changed_at = new Date(); // Record the time of password change.
    }

    // Update the user's profile in the database with the provided validated data.
    const updatedUser = await prisma.user.update({
        where: { id: userID }, // Identify the user to update using their unique ID.
        data: validatedData  // Apply the validated updates to the user's record.
    });

    // Return the updated user information.
    return updatedUser;
};

// Export the functions for use in other parts of the application.
export default {
    profileData,
    updateProfile
};
