import Joi from "joi";
import { MESSAGES } from "../../../utils/messages";

export const createClassParticipantSchema = Joi.object({
  classId: Joi.string().required().messages({
    "any.required": MESSAGES.ERROR.REQUIRED.CLASS_ID,
  }),
});
