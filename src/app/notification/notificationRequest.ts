import Joi from "joi";

export const sendNotificationSchema = Joi.object({
  title: Joi.string().required(),
  body: Joi.string().required(),
  eventId: Joi.string().optional().allow(null),
  meetingId: Joi.string().optional().allow(null),
});
