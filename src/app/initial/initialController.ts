import { NextFunction, Request, Response } from "express";
import { MESSAGE_CODE } from "../../utils/error-code";
import { HandleResponse } from "../../utils/handle-response";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGES } from "../../utils/messages";
import { initialService } from "./initialService";

export const initialController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { body } = req;

  const initial = await initialService(body);

  if (initial instanceof ErrorApp) {
    next(initial);
    return;
  }
  HandleResponse(res, 201, MESSAGE_CODE.SUCCESS, MESSAGES.CREATED.USER.INITIAL);
};
