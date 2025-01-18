import { NextFunction, type Request, type Response } from "express";
import { MESSAGE_CODE } from "../../utils/error-code";
import { HandleResponse } from "../../utils/handle-response";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGES } from "../../utils/messages";
import { getPrestasiService } from "./achievements.service";

export const getPrestasiController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { query } = req;
  const result = await getPrestasiService(query);

  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.PRESTASI.GET,
    result?.data,
    result?.meta
  );
};
