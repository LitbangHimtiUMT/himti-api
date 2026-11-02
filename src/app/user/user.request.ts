import Joi from "joi";
import { MESSAGES } from "../../utils/messages";

export const createUserSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": MESSAGES.ERROR.REQUIRED.NAME,
  }),
  email: Joi.string().required().email().messages({
    "any.required": MESSAGES.ERROR.REQUIRED.EMAIL,
    "string.email": MESSAGES.ERROR.INVALID.GLOBAL.EMAIL,
  }),
  password: Joi.string().required().min(8).messages({
    "any.required": MESSAGES.ERROR.REQUIRED.PASSWORD,
    "string.min": MESSAGES.ERROR.INVALID.USER.PASSWORD_LENGTH,
  }),
});

export const updateUserSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().optional().email().messages({
    "string.email": MESSAGES.ERROR.INVALID.GLOBAL.EMAIL,
  }),
  role: Joi.string()
    .optional()
    .valid("SUPER_ADMIN", "ADMIN", "USER", "ANGGOTA")
    .messages({
      "any.only": "Role must be one of SUPER_ADMIN, ADMIN, USER, ANGGOTA",
    }),
});

export const updateUserRoleSchema = Joi.object({
  role: Joi.string()
    .required()
    .valid("SUPER_ADMIN", "ADMIN", "USER", "ANGGOTA")
    .messages({
      "any.required": "Role is required",
      "any.only": "Role must be one of SUPER_ADMIN, ADMIN, USER, ANGGOTA",
    }),
});
