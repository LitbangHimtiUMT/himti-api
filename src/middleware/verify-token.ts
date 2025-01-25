import { NextFunction, type Request, type Response } from "express";
import { TokenDecodeInterface } from "../interface";
import { TokenExpiredError, decode, verify } from "jsonwebtoken";
import { RequestWithAccessToken } from "../interface/Request";
import { environment } from "../libs";
import { MESSAGE_CODE } from "../utils/error-code";
import { HandleResponse } from "../utils/handle-response";
import { MESSAGES } from "../utils/messages";
import { Role } from "@prisma/client";
import { getUserById } from "../app/authentication/auth.repository";
import { getMentorByUserIdRepository } from "../app/lms/mentor/mentor.repository";

type Mentor = "MENTOR";
type Roles = Array<Role | Mentor>;

export const verifyToken =
  (roles?: Roles) =>
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
      return HandleResponse(
        res,
        401,
        MESSAGE_CODE.UNAUTHORIZED,
        MESSAGES.ERROR.UNAUTHORIZED.FORBIDDEN
      );
    }
    const token = req.headers.authorization.replace("Bearer ", "");
    const decodeToken = decode(token) as TokenDecodeInterface;
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
        if (!(decodeToken as TokenDecodeInterface)?.id) {
          return HandleResponse(
            res,
            401,
            MESSAGE_CODE.UNAUTHORIZED,
            MESSAGES.ERROR.UNAUTHORIZED.RECOGNIZED
          );
        }
        return HandleResponse(
          res,
          401,
          MESSAGE_CODE.UNAUTHORIZED,
          MESSAGES.ERROR.INVALID.AUTH
        );
      }
      const user = await getUserById(decodeToken.id);
      if (!user) {
        return HandleResponse(
          res,
          401,
          MESSAGE_CODE.UNAUTHORIZED,
          MESSAGES.ERROR.UNAUTHORIZED.RECOGNIZED
        );
      }
      if (roles?.length) {
        if (!roles.includes(user.role) && !roles.includes("MENTOR")) {
          return HandleResponse(
            res,
            403,
            MESSAGE_CODE.FORBIDDEN,
            MESSAGES.ERROR.FORBIDDEN.ROLE
          );
        }
        if (roles.includes("MENTOR") && !roles.includes(user.role)) {
          const mentor = await getMentorByUserIdRepository(user.id);
          if (!mentor) {
            return HandleResponse(
              res,
              403,
              MESSAGE_CODE.FORBIDDEN,
              MESSAGES.ERROR.FORBIDDEN.ROLE
            );
          }
          (req as RequestWithAccessToken).mentorId = mentor?.id;
        }
      }
      (req as RequestWithAccessToken).userId = decodeToken?.id;
      next();
    });
  };
