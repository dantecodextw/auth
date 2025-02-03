import userService from "../service/user.service.js";
import apiResponseHandler from "../utils/apiResponseHandler.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import userValidation from "../validation/user.validation.js";

// Controller to fetch the authenticated user's profile details.
const profile = asyncErrorHandler(async (req, res) => {
    // Retrieve profile data using the user ID from the authenticated request.
    const profileData = await userService.profileData(req.user.id);

    // Send a 200 OK response with the fetched profile data in a standardized format.
    res.status(200).json(apiResponseHandler("User profile details have been fetched", profileData));
});

// Controller to update the authenticated user's profile.
const updateProfile = asyncErrorHandler(async (req, res) => {
    // Validate the request body against the updateProfile schema.
    const validatedData = userValidation.updateProfile.validate(req.body);

    // Update the user's profile with the validated data.
    const updatedUser = await userService.updateProfile(validatedData, req.user.id);

    // Return a 200 OK response with the updated user data in a standardized format.
    res.status(200).json(apiResponseHandler('User has been updated successfully', updatedUser));
});

// Export the controllers as named methods.
export default {
    profile,
    updateProfile
};
