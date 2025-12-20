import Joi from "joi";

export const createPotentialUserSchema = Joi.object({
  userId: Joi.string().required(),
  role: Joi.string().required(),
  company: Joi.string().required(),
  experienceYear: Joi.number().required(),
});

export const updatePotentialUserSchema = Joi.object({
  userId: Joi.string().optional(),
  role: Joi.string().optional(),
  company: Joi.string().optional(),
  experienceYear: Joi.number().optional(),
  isActive: Joi.boolean().optional(),
});
