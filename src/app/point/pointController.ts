import { NextFunction, Request, Response } from "express";
import { getUserPointsService } from "./pointService";
import { ErrorApp } from "../../utils/http-error";
import { HandleResponse } from "../../utils/handle-response";
import { MESSAGE_CODE } from "../../utils/error-code";
import { MESSAGES } from "../../utils/messages";

export const getUserPointsController = async (
  _: Request,
  res: Response,
  next: NextFunction
) => {
  const result = await getUserPointsService();

  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.POINTS.GET,
    result
  );
};
