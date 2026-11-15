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

/**
 * Admin gate. The old code only checked the role inside the verify()
 * error branch and called next() unconditionally on success, so any
 * valid JWT passed. Now role AND user existence are checked on the
 * success path. SUPER_ADMIN is a superset of ADMIN: CMS admin login
 * issues tokens for both roles, and blocking SUPER_ADMIN from admin
 * routes would lock the main admin out.
 */
export const VerifyAdmin = async (
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
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    return HandleResponse(
      res,
      403,
      MESSAGE_CODE.FORBIDDEN,
      MESSAGES.ERROR.INVALID.ROLE_ADMIN
    );
  }
  next();
};
