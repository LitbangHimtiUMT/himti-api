import { NextFunction, Response } from "express";
import { RequestWithAccessToken } from "../../interface/Request";
import { MESSAGE_CODE } from "../../utils/error-code";
import { ErrorApp } from "../../utils/http-error";
import { EventRegistrationCreationDTO } from "./event-registration.dto";
import { createEventRegistrationSchema } from "./event-registration.request";
import { createEventRegistrationService } from "./event-registration.service";
import { HandleResponse } from "../../utils/handle-response";
import { MESSAGES } from "../../utils/messages";

export const createEventRegistrationController = async (
  req: RequestWithAccessToken & { file: Express.Multer.File },
  res: Response,
  next: NextFunction
) => {
  const { userId, params, body } = req;
  const { eventId } = params;

  const file = req.file;
  const combine: EventRegistrationCreationDTO = { ...body, eventId, userId };
  if (file) {
    combine.image = file;
  }
  const validate = createEventRegistrationSchema.validate(combine);
  console.log(validate);
  if (validate.error) {
    next(
      new ErrorApp(
        validate.error.message.replace(/"/g, ""),
        400,
        MESSAGE_CODE.BAD_REQUEST
      )
    );
    return;
  }

  const result = await createEventRegistrationService(combine);

  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(
    res,
    201,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.EVENT_REGISTRATION.CREATE
  );
};
