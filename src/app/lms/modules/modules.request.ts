import Joi from "joi";
import { MESSAGES } from "../../../utils/messages";

export const createModuleSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": MESSAGES.ERROR.REQUIRED.NAME,
  }),
  sessionId: Joi.string().required().messages({
    "any.required": MESSAGES.ERROR.REQUIRED.SESSION_ID,
  }),
  textModule: Joi.string().required().allow(null),
  videoUrl: Joi.string().optional().allow(null),
  fileModule: Joi.any().optional().allow(null),
});
