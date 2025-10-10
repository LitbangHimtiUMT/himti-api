import { RegistrationEventTypeEnum } from "@prisma/client";
import Joi from "joi";

export const createRegistrationTypeSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().required(),
  type: Joi.string()
    .valid(...Object.keys(RegistrationEventTypeEnum))
    .required(),
  isActive: Joi.boolean().required(),
  eventId: Joi.string().optional().allow(null, ""),
});

export const updateRegistrationTypeSchema = Joi.object({
  name: Joi.string().optional(),
  year: Joi.number().optional(),
  type: Joi.string()
    .valid(...Object.keys(RegistrationEventTypeEnum))
    .optional(),
  isActive: Joi.boolean().optional(),
  eventId: Joi.string().optional().allow(null, ""),
});
