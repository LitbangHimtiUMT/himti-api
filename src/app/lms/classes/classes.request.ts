import { Level } from "@prisma/client";
import Joi from "joi";

export const createClassSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional().allow(null),
  thumbnail: Joi.any().required(),
  price: Joi.number().required(),
  level: Joi.string()
    .valid(...Object.keys(Level))
    .required(),
  categoryId: Joi.string().required(),
});

export const updateClassSchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional().allow(null),
  thumbnail: Joi.any().optional(),
  price: Joi.number().optional(),
  level: Joi.string()
    .valid(...Object.keys(Level))
    .optional(),
  categoryId: Joi.string().optional(),
});

export const joinInvitationClassSchema = Joi.object({
  code: Joi.string().required(),
});
