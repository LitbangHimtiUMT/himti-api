import Joi from "joi";

export const createSubAcaraSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow("", null).optional(),
  eventId: Joi.string().required(),
  startTime: Joi.date().required(),
  endTime: Joi.date().greater(Joi.ref("startTime")).required(),
  isOpenAbsen: Joi.boolean().optional(),
  image: Joi.any().optional(),
});

export const updateSubAcaraSchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().allow("", null).optional(),
  eventId: Joi.string().optional(),
  startTime: Joi.date().optional(),
  endTime: Joi.date().optional(),
  isOpenAbsen: Joi.boolean().optional(),
  image: Joi.any().optional(),
});
