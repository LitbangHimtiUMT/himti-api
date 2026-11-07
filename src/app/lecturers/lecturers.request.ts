import Joi from "joi";
import { MESSAGES } from "../../utils/messages";

export const createDosenSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": MESSAGES.ERROR.REQUIRED.NAME,
  }),
  nidn: Joi.string().required().messages({
    "any.required": MESSAGES.ERROR.REQUIRED.NIDN,
  }),
  email: Joi.string().required().email().messages({
    "any.required": MESSAGES.ERROR.REQUIRED.EMAIL,
    "string.email": MESSAGES.ERROR.INVALID.GLOBAL.EMAIL,
  }),
  // Kolom Prisma numberPhone adalah String; Joi.number() menolak nomor
  // ber-spasi/strip ("0812 3456 7890") dengan 400. Tidak ada schema
  // update di modul ini (PUT /:id tanpa validasi), jadi ini satu-satunya
  // tempat yang perlu diubah.
  numberPhone: Joi.string().required(),
  lesson: Joi.string().required(),
  isActive: Joi.boolean().optional(),
});
