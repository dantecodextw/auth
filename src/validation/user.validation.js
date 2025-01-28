import joi from "joi"

const updateProfile = joi.object({
    first: joi.string().min(3).empty(''),
    last: joi.string().min(3).empty(''),
    phone: joi.string().min(10).empty(''),
    username: joi.string().min(3).empty(''),
    email: joi.string().email().empty(''),
    password: joi.string().min(6).empty('')
})