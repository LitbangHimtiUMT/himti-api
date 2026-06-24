import Joi from "joi";

const missionItemSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
});

export const createPeriodeSchema = Joi.object({
  name: Joi.string().max(255).optional().allow(""),
  period: Joi.string().max(50).required(),
  logo: Joi.string().max(255).optional().allow(""),
  vision: Joi.string().required(),
  mission: Joi.array().items(missionItemSchema).required(),
  isActive: Joi.boolean().optional(),
});

export const updatePeriodeSchema = Joi.object({
  name: Joi.string().max(255).optional().allow(""),
  period: Joi.string().max(50).optional(),
  logo: Joi.string().max(255).optional().allow(""),
  vision: Joi.string().optional(),
  mission: Joi.array().items(missionItemSchema).optional(),
  isActive: Joi.boolean().optional(),
});
