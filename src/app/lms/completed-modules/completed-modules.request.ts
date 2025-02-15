import Joi from "joi";
import { MESSAGES } from "../../../utils/messages";

export const createCompletedModuleSchema = Joi.object({
  moduleId: Joi.string().required().messages({
    "any.required": MESSAGES.ERROR.REQUIRED.MODULE_ID,
  }),
});
