import Joi from "joi";
import { MESSAGES } from "../../utils/messages";

export const createMemberSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": MESSAGES.ERROR.REQUIRED.NAME,
  }),
  nim: Joi.string().required().max(14).messages({
    "any.required": MESSAGES.ERROR.REQUIRED.NIM,
    "string.max": MESSAGES.ERROR.INVALID.NIM.LENGTH,
  }),
  // `email` tidak lagi wajib: model Member tidak punya kolom email,
  // jadi field ini tidak pernah tersimpan dan CMS sudah berhenti
  // mengirimnya. Sengaja dipertahankan sebagai opsional (bukan dihapus
  // total) supaya CMS lama yang masih mengirim email tidak 400 karena
  // Joi menolak key tak dikenal — urutan merge jadi bebas. Boleh
  // dihapus total setelah CMS baru live.
  email: Joi.string().optional().email().messages({
    "string.email": MESSAGES.ERROR.INVALID.GLOBAL.EMAIL,
  }),
  generationId: Joi.string().required().messages({
    "any.required": MESSAGES.ERROR.REQUIRED.ANGKATAN_ID,
  }),
  isActive: Joi.boolean().optional().messages({
    "any.boolean": MESSAGES.ERROR.INVALID.STATUS,
  }),
});
