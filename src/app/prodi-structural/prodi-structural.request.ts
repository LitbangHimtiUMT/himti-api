import Joi from "joi";

export const createProdiStructuralSchema = Joi.object({
  name: Joi.string().max(255).required(),
  role: Joi.string().max(255).required(),
  image: Joi.string().max(255).optional().allow(""),
  bio: Joi.string().optional().allow(""),
  sequence: Joi.number().integer().min(0).required(),
  isActive: Joi.boolean().optional(),
});

export const updateProdiStructuralSchema = Joi.object({
  name: Joi.string().max(255).optional(),
  role: Joi.string().max(255).optional(),
  image: Joi.string().max(255).optional().allow(""),
  bio: Joi.string().optional().allow(""),
  sequence: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional(),
});
