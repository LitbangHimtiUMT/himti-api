import Joi from "joi";
import { MESSAGES } from "../../utils/messages";
import { DEPARTMENT_CODES } from "./struktural.dto";

export const createStrukturalSchema = Joi.object({
  memberId: Joi.string().required().messages({
    "any.required": MESSAGES.ERROR.REQUIRED.ANGGOTA_ID,
  }),
  jabatan: Joi.string().required().messages({
    "any.required": MESSAGES.ERROR.REQUIRED.JABATAN,
  }),
  isActive: Joi.boolean().optional().messages({
    "any.boolean": MESSAGES.ERROR.INVALID.STATUS,
  }),
  // The CMS form always sends `department`, as "" when nothing is
  // selected. "" is accepted here and coerced to null in the
  // service; a non-empty value must be a known department code.
  department: Joi.string()
    .valid(...DEPARTMENT_CODES, "")
    .optional(),
  image: Joi.any().required().messages({
    "any.required": MESSAGES.ERROR.REQUIRED.IMAGE,
  }),
  signatureImage: Joi.any().optional(),
});
