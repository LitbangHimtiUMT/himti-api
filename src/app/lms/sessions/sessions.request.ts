import Joi from "joi";

export const createSessionSchema = Joi.object({
  name: Joi.string().required(),
});

export const updateSessionSchema = Joi.object({
  name: Joi.string().optional(),
});
