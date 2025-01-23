import { NextFunction, Request, Response } from "express";
import { createMentorService } from "./mentor.service";
import { ErrorApp } from "../../utils/http-error";
import { HandleResponse } from "../../utils/handle-response";
import { MESSAGE_CODE } from "../../utils/error-code";
import { MESSAGES } from "../../utils/messages";

export const createMentorController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;
  const result = await createMentorService(userId);

  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(res, 201, MESSAGE_CODE.CREATED, MESSAGES.CREATED.MENTOR);
};
