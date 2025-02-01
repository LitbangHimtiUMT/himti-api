import { NextFunction, type Response } from "express";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { HandleResponse } from "../../../utils/handle-response";
import { ErrorApp } from "../../../utils/http-error";
import { MESSAGES } from "../../../utils/messages";
import { createSessionService } from "./sessions.service";
import { RequestWithAccessToken } from "../../../interface/Request";
import { createSessionSchema } from "./sessions.request";

export const createSessionController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction,
) => {
  const { body } = req;

  const combine = {
    ...body,
  };

  const validate = createSessionSchema.validate(combine);
  if (validate.error) {
    next(
      new ErrorApp(
        validate.error.message.replace(/"/g, ""),
        400,
        MESSAGE_CODE.BAD_REQUEST,
      ),
    );
    return;
  }

  const session = await createSessionService(combine);

  if (session instanceof ErrorApp) {
    next(session);
    return;
  }

  HandleResponse(res, 201, MESSAGE_CODE.SUCCESS, MESSAGES.CREATED.CLASS);
};
