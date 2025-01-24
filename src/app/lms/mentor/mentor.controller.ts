import { NextFunction, Request, Response } from "express";
import { createMentorService, getMentorsService } from "./mentor.service";
import { ErrorApp } from "../../../utils/http-error";
import { HandleResponse } from "../../../utils/handle-response";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { MESSAGES } from "../../../utils/messages";

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

export const getMentorsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { query } = req;
  const result = await getMentorsService(query);
  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.MENTOR.GET,
    result?.data,
    result?.meta
  );
};
