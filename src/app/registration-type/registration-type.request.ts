import { RegistrationEventTypeEnum } from "@prisma/client";
import Joi from "joi";

export const createRegistrationTypeSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional().allow(null, ""),
  year: Joi.number().required().allow(null, ""),
  type: Joi.string()
    .valid(...Object.keys(RegistrationEventTypeEnum))
    .required(),
  isActive: Joi.boolean().required(),
});

export const updateRegistrationTypeSchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional().allow(null, ""),
  year: Joi.number().optional(),
  type: Joi.string()
    .valid(...Object.keys(RegistrationEventTypeEnum))
    .optional(),
  isActive: Joi.boolean().optional(),
});
