import { NextFunction, type Request, type Response } from "express";
import { MulterError } from "multer";
import { historyErrorSystem } from "../app/history/history.repository";
import { MESSAGE_CODE } from "./error-code";
import { HandleResponse } from "./handle-response";
import { ErrorApp } from "./http-error";
import { MESSAGES } from "./messages";
import { RequestWithAccessToken } from "../interface/Request";

export const HandlingError = async (
  err: ErrorApp | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("errr =>>", err);
  console.log(next);
  const request = req as RequestWithAccessToken;

  const createdBy = request?.userId ?? undefined;
  // Errors raised before the JSON body parser runs (e.g. CORS rejections)
  // reach this handler with req.body undefined. Default it so the handler
  // answers instead of throwing on Object.keys(undefined) and hanging
  // the request (Express 4 does not rescue a throwing async handler).
  const body = req.body ?? {};
  const isHaveParams = !!Object.keys(req.params).length;
  const isHaveBody = !!Object.keys(body).filter(
    (item) => item?.toLowerCase() !== "password"
  ).length;

  // Determine status code and error code based on error type
  let statusCode = 500;
  let errorCode = MESSAGE_CODE.INTERNAL_SERVER_ERROR;

  const { password, ...rest } = body;
  password?.toString();

  // Dapatkan informasi endpoint yang diakses
  const endpoint = `${req.method} ${req.originalUrl}`;

  console.log({ endpoint });

  const errorTitle = `Error => ${err?.message ?? "Error not expected"} ${isHaveBody ? `, Body => ${JSON.stringify(rest)}` : ""} ${isHaveParams ? `, Params => ${JSON.stringify(req.params)}` : ""}`;

  const errorLog = {
    title: errorTitle,
    createdBy,
    statusCode: `${statusCode} - ${errorCode}`,
    endpoint,
  };

  if (err instanceof ErrorApp) {
    statusCode = err.statusCode;
    errorCode = err.code;
    errorLog.statusCode = `${statusCode} - ${errorCode}`;

    await historyErrorSystem(errorLog);
    return HandleResponse(res, err.statusCode, err.code, err.message);
  }
  if (err instanceof MulterError) {
    statusCode = 400;
    errorCode = MESSAGE_CODE.BAD_REQUEST;
    errorLog.statusCode = `${statusCode} - ${errorCode}`;

    await historyErrorSystem(errorLog);
    return HandleResponse(res, 400, MESSAGE_CODE.BAD_REQUEST, err.message);
  }
  console.log({ err });
  await historyErrorSystem(errorLog);
  return HandleResponse(
    res,
    500,
    MESSAGE_CODE.INTERNAL_SERVER_ERROR,
    MESSAGES.ERROR.SERVER_ERROR.INTERNAL_SERVER_ERROR
  );
};
