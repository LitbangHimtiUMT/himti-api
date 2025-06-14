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
  const isHaveParams = !!Object.keys(req.params).length;
  const isHaveBody = !!Object.keys(req.body).filter(
    (item) => item?.toLowerCase() !== "password"
  ).length;

  // Determine status code and error code based on error type
  let statusCode = 500;
  let errorCode = MESSAGE_CODE.INTERNAL_SERVER_ERROR;

  const { password, ...rest } = req.body;
  password?.toString();

  const errorTitle = `Error => ${err?.message ?? "Error not expected"} ${isHaveBody ? `, Body => ${JSON.stringify(rest)}` : ""} ${isHaveParams ? `, Params => ${JSON.stringify(req.params)}` : ""}`;

  if (err instanceof ErrorApp) {
    statusCode = err.statusCode;
    errorCode = err.code;

    await historyErrorSystem({
      title: errorTitle,
      createdBy,
      statusCode: `${statusCode} - ${errorCode}`,
    });
    return HandleResponse(res, err.statusCode, err.code, err.message);
  }
  if (err instanceof MulterError) {
    statusCode = 400;
    errorCode = MESSAGE_CODE.BAD_REQUEST;
    await historyErrorSystem({
      title: errorTitle,
      createdBy,
      statusCode: `${statusCode} - ${errorCode}`,
    });
    return HandleResponse(res, 400, MESSAGE_CODE.BAD_REQUEST, err.message);
  }
  console.log({ err });
  await historyErrorSystem({
    title: errorTitle,
    createdBy,
    statusCode: `${statusCode} - ${errorCode}`,
  });
  return HandleResponse(
    res,
    500,
    MESSAGE_CODE.INTERNAL_SERVER_ERROR,
    MESSAGES.ERROR.SERVER_ERROR.INTERNAL_SERVER_ERROR
  );
};
