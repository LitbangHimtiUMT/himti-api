import Joi from "joi";

export const createPotentialUserSchema = Joi.object({
  userId: Joi.string().optional(),
  nim: Joi.string().optional(),
  email: Joi.string().email().optional(),
  role: Joi.string().required(),
  company: Joi.string().required(),
  experienceYear: Joi.number().required(),
  keyUsed: Joi.string().required(),
  summary: Joi.string().optional().allow(""),
  skills: Joi.array().items(Joi.string()).optional(),
  projects: Joi.array().optional().allow(null),
  education: Joi.array().optional().allow(null),
  portfolioUrl: Joi.string().uri().optional().allow(""),
  resumeUrl: Joi.string().uri().optional().allow(""),
}).or("userId", "nim", "email");

export const updatePotentialUserSchema = Joi.object({
  userId: Joi.string().optional(),
  role: Joi.string().optional(),
  company: Joi.string().optional(),
  experienceYear: Joi.number().optional(),
  isActive: Joi.boolean().optional(),
  summary: Joi.string().optional().allow(""),
  skills: Joi.array().items(Joi.string()).optional(),
  projects: Joi.array().optional().allow(null),
  education: Joi.array().optional().allow(null),
  portfolioUrl: Joi.string().uri().optional().allow(""),
  resumeUrl: Joi.string().uri().optional().allow(""),
});
