import Joi from "joi";

export const createTicketSupportSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    file: Joi.any().required(),
})