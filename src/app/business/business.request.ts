import Joi from "joi";

export const createBusinessSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  url: Joi.string().optional().allow(null),
  price: Joi.number().required(),
  contactPerson: Joi.string().required(),
  image: Joi.any().required(),
});
