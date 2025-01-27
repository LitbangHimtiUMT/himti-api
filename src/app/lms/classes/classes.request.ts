import Joi from "joi";
import { MESSAGES } from "../../../utils/messages";

export const createClassSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": MESSAGES.ERROR.REQUIRED.NAME,
  }),
  description: Joi.string().optional().allow(null),
  thumbnail: Joi.any().required().messages({
    "any.required": MESSAGES.ERROR.REQUIRED.IMAGE,
  }),
  price: Joi.number().required().messages({
    "any.required": MESSAGES.ERROR.REQUIRED.PRICE,
  }),
  level: Joi.string().required().messages({
    "any.required": MESSAGES.ERROR.REQUIRED.LEVEL,
  }),
  categoryId: Joi.string().required().messages({
    "any.required": MESSAGES.ERROR.REQUIRED.CATEGORY_ID,
  }),
});
