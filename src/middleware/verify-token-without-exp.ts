import { NextFunction, type Request, type Response } from "express";
import { TokenDecodeInterface } from "../interface";
import { decode, verify } from "jsonwebtoken";
import { RequestWithAccessToken } from "../interface/Request";
import { environment } from "../libs";
import { MESSAGE_CODE } from "../utils/error-code";
import { HandleResponse } from "../utils/handle-response";
import { MESSAGES } from "../utils/messages";

export const VerifyTokenWithoutExp = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const key = req.header(environment.HEADER_KEY) as string;
  const auth = req.headers.authorization;
  if (!key && !auth) {
    return HandleResponse(
      res,
      403,
      MESSAGE_CODE.FORBIDDEN,
      MESSAGES.ERROR.UNAUTHORIZED.ACCESS
    );
  }

  if (key) {
    if (atob(key) !== environment.SECRET_KEY) {
      return HandleResponse(
        res,
        403,
        MESSAGE_CODE.FORBIDDEN,
        MESSAGES.ERROR.UNAUTHORIZED.ACCESS
      );
    }
  }

  if (!auth) {
    return HandleResponse(
      res,
      401,
      MESSAGE_CODE.UNAUTHORIZED,
      MESSAGES.ERROR.UNAUTHORIZED.FORBIDDEN
    );
  }
  const token = auth.replace("Bearer ", "");
  verify(token, environment.JWT_SECRET as string, (err: unknown) => {
    if (err) {
      const decodeToken = decode(token);
      if (!(decodeToken as TokenDecodeInterface)?.id) {
        return HandleResponse(
          res,
          401,
          MESSAGE_CODE.UNAUTHORIZED,
          MESSAGES.ERROR.UNAUTHORIZED.RECOGNIZED
        );
      }
    }
    (req as RequestWithAccessToken).userId = (
      decode(token) as TokenDecodeInterface
    )?.id;
    next();
  });
};
