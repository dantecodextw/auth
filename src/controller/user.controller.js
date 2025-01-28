import userService from "../service/user.service.js";
import apiResponseHandler from "../utils/apiResponseHandler.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import authValidation from "../validation/auth.validation.js";

const profile = asyncErrorHandler(async (req, res) => {
    const profileData = await userService.profileData(req.user.id)
    res.status(200).json(apiResponseHandler("User profile details has been fetched", profileData))
})

const updateProfile = asyncErrorHandler(async (req, res) => {
    const { error, value } = authValidation.signup.validate(req.body)
    if (error) throw new CustomError(error.details[0].message, 400, error.details)

    const updatedUser = await userService.updateProfile(value)

    res.status(200).json(apiResponseHandler('User has been updated successfully', updatedUser))
})

export default {
    profile,
    updateProfile
}