import Joi from "joi";
import { MESSAGES } from "../../../utils/messages";

export const createSessionSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": MESSAGES.ERROR.REQUIRED.NAME,
  }),
  classId: Joi.string().required().messages({
    "any.required": MESSAGES.ERROR.REQUIRED.CLASS_ID,
  }),
});
