import Joi from "joi";

export const createEventRegistrationSchema = Joi.object({
  eventId: Joi.string().required(),
  userId: Joi.string().required(),
  material: Joi.string().optional().allow(null, ""),
  class: Joi.string().required(),
  image: Joi.any().optional().allow(null),
});
