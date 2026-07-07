import { NextFunction, Request, Response } from "express";
import { HandleResponse } from "../utils/handle-response";
import { MESSAGE_CODE } from "../utils/error-code";
import { MESSAGES } from "../utils/messages";
import { environment } from "../libs";

export const verifyKey = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const key = req.headers[environment.HEADER_KEY.toLowerCase()];
  const apiKeyStr = (Array.isArray(key) ? key[0] : key) || "";
  if (!apiKeyStr) {
    return HandleResponse(
      res,
      403,
      MESSAGE_CODE.FORBIDDEN,
      MESSAGES.ERROR.UNAUTHORIZED.ACCESS
    );
  }

  if (atob(apiKeyStr) !== environment.SECRET_KEY) {
    return HandleResponse(
      res,
      403,
      MESSAGE_CODE.FORBIDDEN,
      MESSAGES.ERROR.UNAUTHORIZED.ACCESS
    );
  }
  next();
};
