import Joi from "joi";

export const createBusinessSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
  contactPerson: Joi.string().required(),
  image: Joi.any().required(),
});
