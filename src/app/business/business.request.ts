import Joi from "joi";

export const createBusinessSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  url: Joi.string().optional().allow(null),
  startPrice: Joi.number().required(),
  endPrice: Joi.number().required(),
  contactPerson: Joi.string().required(),
});

export const uploadImageBusinessSchema = Joi.object({
  image: Joi.any().required(),
});
