import userService from "../service/user.service.js";
import apiResponseHandler from "../utils/apiResponseHandler.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import userValidation from "../validation/user.validation.js";

const profile = asyncErrorHandler(async (req, res) => {
    const profileData = await userService.profileData(req.user.id)
    res.status(200).json(apiResponseHandler("User profile details has been fetched", profileData))
})

const updateProfile = asyncErrorHandler(async (req, res) => {
    const validatedData = userValidation.updateProfile.validate(req.body)

    const updatedUser = await userService.updateProfile(validatedData, req.user.id)

    res.status(200).json(apiResponseHandler('User has been updated successfully', updatedUser))
})

export default {
    profile,
    updateProfile
}