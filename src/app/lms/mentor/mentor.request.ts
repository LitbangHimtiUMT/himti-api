import Joi from "joi";

export const createMentorSchema = Joi.object({
  instagram: Joi.string().optional().allow(null),
  facebook: Joi.string().optional().allow(null),
  twitter: Joi.string().optional().allow(null),
  linkedin: Joi.string().optional().allow(null),
});
