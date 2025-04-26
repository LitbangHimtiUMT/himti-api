import { NextFunction, type Request, type Response } from "express";
import { MESSAGE_CODE } from "./error-code";
import { HandleResponse } from "./handle-response";
import { ErrorApp } from "./http-error";
import { MESSAGES } from "./messages";
import { MulterError } from "multer";

export const HandlingError = (
  err: ErrorApp | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("errr =>>", err);
  console.log(next);
  if (err instanceof ErrorApp) {
    console.log({
      err,
    });
    return HandleResponse(res, err.statusCode, err.code, err.message);
  }
  if (err instanceof MulterError) {
    return HandleResponse(res, 400, MESSAGE_CODE.BAD_REQUEST, err.message);
  }
  console.log({ err });
  return HandleResponse(
    res,
    500,
    MESSAGE_CODE.INTERNAL_SERVER_ERROR,
    MESSAGES.ERROR.SERVER_ERROR.INTERNAL_SERVER_ERROR
  );
};
