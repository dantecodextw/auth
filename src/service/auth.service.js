// Import necessary modules
import * as argon2 from "argon2" // Import argon2 for hashing and verifying passwords
import prisma from "../../prisma/client/prismaClient.js" // Import Prisma client to interact with the database
import CustomError from "../utils/customErrorHandler.js" // Custom error handler for application-specific errors
import jwt from "jsonwebtoken" // Import jsonwebtoken to generate authentication tokens

// Function to generate a JWT token for a user
const generateToken = (userID) => {
    // Sign and return a JWT token with user ID as the payload, using a secret from environment variables
    return jwt.sign({ id: userID }, process.env.JWT_SECRET, { expiresIn: "1h" })
}

// Signup function to handle user registration
const signup = async (validatedData) => {
    // Hash the password before saving the user to the database (security measure)
    validatedData.password = await argon2.hash(validatedData.password)

    // Create a new user in the database using the validated data
    const newUser = await prisma.user.create({
        data: validatedData
    })

    // If user creation fails, throw a custom error
    if (!newUser) throw new CustomError("Failed to create user", 400)

    // Return the newly created user object without the password for security reasons
    return newUser
}

// Login function to authenticate users and return a JWT token
const login = async (validatedData) => {
    const { identifier, password } = validatedData // Destructure the validated login data

    // Find a user based on the identifier (either username or email)
    const user = await prisma.user.findFirst({
        where: {
            OR: [ // Search by either username or email
                { username: identifier },
                { email: identifier }
            ]
        },
        omit: { password: false }
    })

    // If no user is found or the password is incorrect, throw an authentication error
    if (!user || !(await argon2.verify(user.password, password))) {
        throw new CustomError("Invalid login credentials", 401)
    }

    // Generate an authentication token for the user
    const token = generateToken(user.id)

    // Return the user data along with the generated token, without the password for security
    return {
        ...user,
        password: undefined,
        accessToken: token // Include the generated JWT token
    }
}

// Export the signup and login methods so they can be used in other parts of the app
export default {
    signup,
    login
}
