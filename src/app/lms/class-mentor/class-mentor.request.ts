import Joi from "joi";

export const inviteMentorSchema = Joi.object({
    mentorId: Joi.string().required(),
    classId: Joi.string().required(),
})