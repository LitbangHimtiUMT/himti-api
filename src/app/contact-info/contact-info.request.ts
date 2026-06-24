import Joi from "joi";

export const createContactInfoSchema = Joi.object({
  key: Joi.string().max(100).required(),
  value: Joi.string().required(),
  group: Joi.string().max(100).required(),
});

export const updateContactInfoSchema = Joi.object({
  value: Joi.string().required(),
  group: Joi.string().max(100).optional(),
});

export const batchUpdateContactInfoSchema = Joi.array().items(
  Joi.object({
    key: Joi.string().max(100).required(),
    value: Joi.string().required(),
    group: Joi.string().max(100).required(),
  })
);
