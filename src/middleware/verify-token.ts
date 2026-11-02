import { NextFunction, type Request, type Response } from "express";
import { TokenExpiredError } from "jsonwebtoken";
import { RequestWithAccessToken } from "../interface/Request";
import { MESSAGE_CODE } from "../utils/error-code";
import { HandleResponse } from "../utils/handle-response";
import { MESSAGES } from "../utils/messages";
import { verifyAccessToken } from "../utils/auth-tokens";
import { Role } from "@prisma/client";
import { getUserById } from "../app/authentication/auth.repository";
import { getMentorByUserIdRepository } from "../app/lms/mentor/mentor.repository";

type Mentor = "MENTOR";
type Roles = Array<Role | Mentor>;

export enum RolesEnum {
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
  MENTOR = "MENTOR",
  ANGGOTA = "ANGGOTA",
  USER = "USER",
}

const extractBearer = (req: Request): string | null => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return null;
  return auth.replace("Bearer ", "");
};

const unauthorized = (res: Response, message: string) =>
  HandleResponse(res, 401, MESSAGE_CODE.UNAUTHORIZED, message);

/**
 * JWT-only authentication. The old header-secret bypass was removed:
 * a shared header is not user authentication, and the old code also
 * trusted an unverified decoded payload when a header was present.
 * Only a signature-verified access token, belonging to an existing
 * user, sets req.userId.
 */
export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = extractBearer(req);
  if (!token) {
    return unauthorized(res, MESSAGES.ERROR.UNAUTHORIZED.FORBIDDEN);
  }
  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      return unauthorized(res, MESSAGES.ERROR.UNAUTHORIZED.EXPIRED);
    }
    return unauthorized(res, MESSAGES.ERROR.INVALID.AUTH);
  }
  if (!decoded?.id) {
    return unauthorized(res, MESSAGES.ERROR.UNAUTHORIZED.RECOGNIZED);
  }
  const user = await getUserById(decoded.id);
  if (!user) {
    return unauthorized(res, MESSAGES.ERROR.UNAUTHORIZED.RECOGNIZED);
  }
  (req as RequestWithAccessToken).userId = decoded.id;
  next();
};

/**
 * Optional verified identity, for public catalog routes (class list /
 * detail). No token -> anonymous (published classes only, decided by
 * the service). A present but invalid/expired token is rejected, so a
 * forged token can never spoof another user's visibility. This
 * replaces the old custom class handlers that trusted decode() and
 * the header secret.
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = extractBearer(req);
  if (!token) {
    next();
    return;
  }
  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      return unauthorized(res, MESSAGES.ERROR.UNAUTHORIZED.EXPIRED);
    }
    return unauthorized(res, MESSAGES.ERROR.INVALID.AUTH);
  }
  if (!decoded?.id) {
    return unauthorized(res, MESSAGES.ERROR.UNAUTHORIZED.RECOGNIZED);
  }
  const user = await getUserById(decoded.id);
  if (!user) {
    return unauthorized(res, MESSAGES.ERROR.UNAUTHORIZED.RECOGNIZED);
  }
  (req as RequestWithAccessToken).userId = decoded.id;
  next();
};

/**
 * Role gate with verified identity.
 *
 * Allowed iff: user.role is in the requested list, OR the requested
 * list contains MENTOR and the user has a mentor record. The old code
 * passed the first check for ANY role whenever the list contained
 * MENTOR, which let ordinary users through mentor/admin gates.
 * When access comes via the mentor record, req.mentorId is set.
 */
export const verifyRole =
  (roles?: Roles) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const token = extractBearer(req);
    if (!token) {
      return unauthorized(res, MESSAGES.ERROR.UNAUTHORIZED.FORBIDDEN);
    }
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        return unauthorized(res, MESSAGES.ERROR.UNAUTHORIZED.EXPIRED);
      }
      return unauthorized(res, MESSAGES.ERROR.INVALID.AUTH);
    }
    if (!decoded?.id) {
      return unauthorized(res, MESSAGES.ERROR.UNAUTHORIZED.RECOGNIZED);
    }
    const user = await getUserById(decoded.id);
    if (!user) {
      return unauthorized(res, MESSAGES.ERROR.UNAUTHORIZED.RECOGNIZED);
    }
    if (roles?.length) {
      const roleMatches = roles.includes(user.role as Role | Mentor);
      let mentorMatches = false;
      if (!roleMatches && roles.includes("MENTOR")) {
        const mentor = await getMentorByUserIdRepository(user.id);
        if (mentor) {
          mentorMatches = true;
          (req as RequestWithAccessToken).mentorId = mentor.id;
        }
      } else if (roles.includes("MENTOR")) {
        // Role already matched, but still expose mentorId when present.
        const mentor = await getMentorByUserIdRepository(user.id);
        if (mentor) {
          (req as RequestWithAccessToken).mentorId = mentor.id;
        }
      }
      if (!roleMatches && !mentorMatches) {
        return HandleResponse(
          res,
          403,
          MESSAGE_CODE.FORBIDDEN,
          MESSAGES.ERROR.FORBIDDEN.ROLE
        );
      }
    }
    (req as RequestWithAccessToken).userId = decoded.id;
    next();
  };
