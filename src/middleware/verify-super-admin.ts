import { NextFunction, type Request, type Response } from "express";
import { TokenExpiredError } from "jsonwebtoken";
import { getUserById } from "../app/authentication/auth.repository";
import { MESSAGE_CODE } from "../utils/error-code";
import { HandleResponse } from "../utils/handle-response";
import { MESSAGES } from "../utils/messages";
import { verifyAccessToken } from "../utils/auth-tokens";
import {
  extractAccessToken,
  hasCookieCsrfHeader,
} from "../utils/auth-cookies";
import { Roles } from "../interface/Roles";

/**
 * Super-admin gate. Same fix as VerifyAdmin: the old code checked
 * the role only in the verify() error branch, called next() on
 * success for any valid JWT, and printed the token and the decoded
 * payload to the log. Now only a signature-verified token of an
 * existing SUPER_ADMIN user passes. No logging of tokens here.
 */
export const VerifySuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const extracted = extractAccessToken(req);
  if (!extracted) {
    return HandleResponse(
      res,
      401,
      MESSAGE_CODE.UNAUTHORIZED,
      MESSAGES.ERROR.UNAUTHORIZED.FORBIDDEN
    );
  }
  const token = extracted.token;
  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      return HandleResponse(
        res,
        401,
        MESSAGE_CODE.UNAUTHORIZED,
        MESSAGES.ERROR.UNAUTHORIZED.EXPIRED
      );
    }
    return HandleResponse(
      res,
      401,
      MESSAGE_CODE.UNAUTHORIZED,
      MESSAGES.ERROR.INVALID.AUTH
    );
  }
  if (!decoded?.id) {
    return HandleResponse(
      res,
      401,
      MESSAGE_CODE.UNAUTHORIZED,
      MESSAGES.ERROR.UNAUTHORIZED.RECOGNIZED
    );
  }
  // CSRF check for cookie authentication, after signature verification
  // and before the database lookup. Bearer requests skip it.
  if (extracted.method === "cookie" && !hasCookieCsrfHeader(req)) {
    return HandleResponse(
      res,
      403,
      MESSAGE_CODE.FORBIDDEN,
      MESSAGES.ERROR.FORBIDDEN.CSRF
    );
  }
  const user = await getUserById(decoded.id);
  if (!user) {
    return HandleResponse(
      res,
      401,
      MESSAGE_CODE.UNAUTHORIZED,
      MESSAGES.ERROR.UNAUTHORIZED.RECOGNIZED
    );
  }
  if (user.role !== Roles.SUPER_ADMIN) {
    return HandleResponse(
      res,
      403,
      MESSAGE_CODE.FORBIDDEN,
      MESSAGES.ERROR.INVALID.ROLE_ADMIN
    );
  }
  next();
};
