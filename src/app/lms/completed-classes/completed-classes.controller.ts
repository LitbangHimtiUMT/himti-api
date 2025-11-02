import { NextFunction, type Response } from "express";
import { RequestWithAccessToken } from "../../../interface/Request";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { HandleResponse } from "../../../utils/handle-response";
import { ErrorApp } from "../../../utils/http-error";
import { MESSAGES } from "../../../utils/messages";
import { createCompletedClassService } from "./completed-classes.service";

export const createCompletedClassController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req;
  const { body } = req;

  const completedClass = await createCompletedClassService(
    body,
    userId as string,
  );

  if (completedClass instanceof ErrorApp) {
    next(completedClass);
    return;
  }

  HandleResponse(
    res,
    201,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.CREATED.COMPLETED_CLASS,
  );
};
