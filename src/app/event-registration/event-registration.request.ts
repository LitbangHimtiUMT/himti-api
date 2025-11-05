import Joi from "joi";

export const createEventRegistrationSchema = Joi.object({
  name: Joi.string().required(),
  nim: Joi.string().optional().allow(null, ""),
  phoneNumber: Joi.string().optional().allow(null, ""),
  class: Joi.string().optional().allow(null, ""),
  generation: Joi.number().optional(),
  categoryId: Joi.string().optional(),
  // allow file merged by controller (multer), keep optional
  image: Joi.any().optional(),
  registrationTypeId: Joi.string().required(),
  userId: Joi.string().optional(),
  eventId: Joi.string().optional(),
});

export const updateEventRegistrationSchema = Joi.object({
  name: Joi.string().optional(),
  nim: Joi.string().optional().allow(null, ""),
  class: Joi.string().optional().allow(null, ""),
  generation: Joi.number().optional(),
  categoryId: Joi.string().optional(),
  image: Joi.string().optional(),
  registrationTypeId: Joi.string().optional(),
  userId: Joi.string().optional(),
  eventId: Joi.string().optional(),
});
