import { Level } from "@prisma/client";
import Joi from "joi";

export const createClassSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional().allow(null),
  thumbnail: Joi.any().required(),
  price: Joi.number().required(),
  level: Joi.string()
    .valid(...Object.keys(Level))
    .required(),
  categoryId: Joi.string().required(),
});
