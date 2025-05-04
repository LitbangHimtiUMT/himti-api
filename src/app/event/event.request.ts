import Joi from "joi";
import { MESSAGES } from "../../utils/messages";
import { EventType } from "@prisma/client";

export const createEventSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.string": MESSAGES.ERROR.REQUIRED.NAME,
  }),
  description: Joi.string().required().messages({
    "any.string": MESSAGES.ERROR.REQUIRED.DESCRIPTION,
  }),
  isOpen: Joi.optional(),
  startTime: Joi.date().required().messages({
    "any.required": MESSAGES.ERROR.REQUIRED.START_TIME,
    "date.base": MESSAGES.ERROR.INVALID.DATE,
  }),
  eventType: Joi.string().valid(...Object.keys(EventType)).required(),
  endTime: Joi.date().required().messages({
    "any.required": MESSAGES.ERROR.REQUIRED.END_TIME,
    "date.base": MESSAGES.ERROR.INVALID.DATE,
  }),
  image: Joi.any().required().messages({
    "any.required": MESSAGES.ERROR.REQUIRED.IMAGE,
  }),
});
