import joi from 'joi'

const signup = joi.object({
    first: joi.string().min(3).required(),
    last: joi.string().min(3).required(),
    phone: joi.number().min(10).required(),
    username: joi.string().min(3).required(),
    email: joi.string().email().required(),
    password: joi.string().min(6).required()
})

const login = joi.object({
    identity: joi.string().min(3).required(),
    password: joi.string().min(6).required()
})

export default {
    signup, login
}