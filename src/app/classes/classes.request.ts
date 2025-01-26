import Joi from "joi";
import { MESSAGES } from "../../utils/messages";

export const createClassSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": MESSAGES.ERROR.REQUIRED.NAME,
  }),
  description: Joi.string().optional().allow(null),
  thumbnail: Joi.string().optional().messages({
    "any.required": MESSAGES.ERROR.REQUIRED.START_TIME,
  }),
  price: Joi.number().required().messages({
    "any.required": MESSAGES.ERROR.REQUIRED.END_TIME,
  }),
  createdBy: Joi.string().required().messages({
    "any.required": MESSAGES.ERROR.REQUIRED.EVENT_MEETING_ID,
  }),
});
