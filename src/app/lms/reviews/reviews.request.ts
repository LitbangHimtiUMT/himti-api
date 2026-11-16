import Joi from "joi";

export const createReviewSchema = Joi.object({
  classId: Joi.string().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  text: Joi.string().max(1000).optional().allow(null, ""),
});
