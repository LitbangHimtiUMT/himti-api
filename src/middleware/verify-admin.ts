import { NextFunction, type Request, type Response } from "express";
import { TokenDecodeInterface } from "../interface";
import { TokenExpiredError, decode, verify } from "jsonwebtoken";
import { getUserById } from "../app/authentication/auth.repository";
import { environment } from "../libs";
import { MESSAGE_CODE } from "../utils/error-code";
import { HandleResponse } from "../utils/handle-response";
import { MESSAGES } from "../utils/messages";

export const VerifyAdmin = (
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
  verify(token, environment.JWT_SECRET as string, async (err: unknown) => {
    if (err) {
      if (err instanceof TokenExpiredError) {
        return HandleResponse(
          res,
          401,
          MESSAGE_CODE.UNAUTHORIZED,
          MESSAGES.ERROR.UNAUTHORIZED.EXPIRED
        );
      }
      const decodeToken = decode(token);
      if (!(decodeToken as TokenDecodeInterface)?.id) {
        return HandleResponse(
          res,
          401,
          MESSAGE_CODE.UNAUTHORIZED,
          MESSAGES.ERROR.UNAUTHORIZED.RECOGNIZED
        );
      }
      if ((decodeToken as TokenDecodeInterface)?.id) {
        const { id } = decodeToken as TokenDecodeInterface;
        const getUser = await getUserById(id);

        if (!getUser) {
          return HandleResponse(
            res,
            401,
            MESSAGE_CODE.NOT_FOUND,
            MESSAGES.ERROR.NOT_FOUND.USER.ACCOUNT
          );
        }

        if (getUser.role !== "ADMIN") {
          return HandleResponse(
            res,
            401,
            MESSAGE_CODE.UNAUTHORIZED,
            MESSAGES.ERROR.INVALID.ROLE_ADMIN
          );
        }
      }
      return HandleResponse(
        res,
        401,
        MESSAGE_CODE.UNAUTHORIZED,
        MESSAGES.ERROR.INVALID.AUTH
      );
    }
    next();
  });
};
