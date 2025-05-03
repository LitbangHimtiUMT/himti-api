import { AssignmentType } from "@prisma/client";
import Joi from "joi";

export const createAssignmentSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().optional().allow(null),
  isFinalAssignment: Joi.boolean().optional().allow(null),
  dueDate: Joi.date().required(),
  type: Joi.string()
    .valid(...Object.keys(AssignmentType))
    .required(),
  allowedFile: Joi.string().optional().allow(null),
});
