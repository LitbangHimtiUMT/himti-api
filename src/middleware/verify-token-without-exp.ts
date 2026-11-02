import { NextFunction, type Request, type Response } from "express";
import { TokenExpiredError } from "jsonwebtoken";
import { RequestWithAccessToken } from "../interface/Request";
import { MESSAGE_CODE } from "../utils/error-code";
import { HandleResponse } from "../utils/handle-response";
import { MESSAGES } from "../utils/messages";
import { verifyAccessToken } from "../utils/auth-tokens";

/**
 * Logout-only gate: the signature MUST verify, but expiry is waived
 * so an expired session can still be logged out (FCM cleanup). The
 * old version waived both signature and expiry (it set userId from
 * an unverified decode on any error) and also accepted a header
 * secret. Both are gone: a forged token is rejected even here.
 * Only used by GET /auth/logout.
 */
export const VerifyTokenWithoutExp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return HandleResponse(
      res,
      401,
      MESSAGE_CODE.UNAUTHORIZED,
      MESSAGES.ERROR.UNAUTHORIZED.FORBIDDEN
    );
  }
  const token = auth.replace("Bearer ", "");
  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      // Signature was verified by jwt.verify before expiry was
      // reported, so the payload is trustworthy for logout.
      // Re-verify without expiry check is not possible with the
      // shared helper, so decode the payload only after the
      // signature error class proved it is an expiry error.
      // jsonwebtoken throws TokenExpiredError only for a token
      // whose signature verified but whose exp has passed.
      const parts = token.split(".");
      if (parts.length !== 3) {
        return HandleResponse(
          res,
          401,
          MESSAGE_CODE.UNAUTHORIZED,
          MESSAGES.ERROR.INVALID.AUTH
        );
      }
      try {
        const payload = JSON.parse(
          Buffer.from(parts[1], "base64url").toString("utf8")
        ) as { id?: string };
        if (!payload?.id) {
          return HandleResponse(
            res,
            401,
            MESSAGE_CODE.UNAUTHORIZED,
            MESSAGES.ERROR.UNAUTHORIZED.RECOGNIZED
          );
        }
        (req as RequestWithAccessToken).userId = payload.id;
        next();
        return;
      } catch {
        return HandleResponse(
          res,
          401,
          MESSAGE_CODE.UNAUTHORIZED,
          MESSAGES.ERROR.INVALID.AUTH
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
  if (!decoded?.id) {
    return HandleResponse(
      res,
      401,
      MESSAGE_CODE.UNAUTHORIZED,
      MESSAGES.ERROR.UNAUTHORIZED.RECOGNIZED
    );
  }
  (req as RequestWithAccessToken).userId = decoded.id;
  next();
};
