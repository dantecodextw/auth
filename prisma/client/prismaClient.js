// Import the PrismaClient from the Prisma package to interact with the database
import { PrismaClient } from "@prisma/client";

// Create a new instance of the PrismaClient
// The 'omit' option is used to prevent the 'password' field from being included in query results for the 'user' model
const prisma = new PrismaClient({
    omit: {
        user: { password: true } // Excludes the 'password' field from being returned when querying the 'user' model
    }
});

// Export the configured Prisma client instance to be used in other parts of the application
export default prisma;
