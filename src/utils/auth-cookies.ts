import type { Request, Response } from "express";
import { environment } from "../libs";

export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";
export const REFRESH_TOKEN_COOKIE_PATH = "/auth/refresh-token";
export const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export type TokenMethod = "bearer" | "cookie";

export interface ExtractedToken {
  token: string;
  method: TokenMethod;
}

const UNIT_MS: Record<string, number> = {
  ms: 1,
  millisecond: 1,
  milliseconds: 1,
  s: 1000,
  sec: 1000,
  secs: 1000,
  second: 1000,
  seconds: 1000,
  m: 60 * 1000,
  min: 60 * 1000,
  mins: 60 * 1000,
  minute: 60 * 1000,
  minutes: 60 * 1000,
  h: 60 * 60 * 1000,
  hr: 60 * 60 * 1000,
  hrs: 60 * 60 * 1000,
  hour: 60 * 60 * 1000,
  hours: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  days: 24 * 60 * 60 * 1000,
  w: 7 * 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  weeks: 7 * 24 * 60 * 60 * 1000,
  y: 365 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000,
  years: 365 * 24 * 60 * 60 * 1000,
};

/**
 * Duration parser mirroring what jsonwebtoken accepts for expiresIn:
 * a bare number means seconds, a string carries one unit ("3d",
 * "15m", "1h", "30s"). Returns milliseconds, or null when the value
 * cannot be parsed. A bare numeric string is read as seconds too, so
 * the cookie never expires before the token it carries.
 */
export const parseDurationToMs = (
  value: string | number | undefined | null
): number | null => {
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value <= 0) return null;
    return Math.floor(value * 1000);
  }
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const match = /^(-?\d+(?:\.\d+)?)\s*([a-z]*)$/i.exec(trimmed);
  if (!match) return null;
  const amount = Number(match[1]);
  const unit = (match[2] || "s").toLowerCase();
  const multiplier = UNIT_MS[unit];
  if (multiplier === undefined || !Number.isFinite(amount) || amount <= 0) {
    return null;
  }
  return Math.floor(amount * multiplier);
};

/**
 * Access-token lifetime in ms, read from the same env value the
 * signer uses (environment.JWT_EXPIRES, default "3d"). Falls back to
 * 3 days when the value is unparseable; in practice an unparseable
 * value already makes jwt.sign throw before any cookie is set.
 */
export const getAccessTokenMaxAgeMs = (): number =>
  parseDurationToMs(environment.JWT_EXPIRES) ?? 3 * 24 * 60 * 60 * 1000;

/**
 * No NODE_ENV convention exists anywhere else in this codebase, so
 * the check reads process.env directly, the same way index.ts reads
 * CORS_ALLOWED_ORIGINS. Cookies are Secure in production only: local
 * development serves over plain http.
 */
const isProduction = (): boolean => process.env.NODE_ENV === "production";

/**
 * Reads one cookie as a plain string. Anything else is ignored: a
 * non-string value, an empty value, and the legacy `j:` JSON cookie
 * the old login code wrote (it serialized the whole login object).
 * Legacy cookies are never parsed, so a stale one cannot smuggle a
 * token object into the auth path.
 */
const readPlainCookie = (req: Request, name: string): string | null => {
  const cookies = (req as unknown as { cookies?: Record<string, unknown> })
    .cookies;
  if (!cookies || typeof cookies !== "object") return null;
  const value = cookies[name];
  if (typeof value !== "string" || !value || value.startsWith("j:")) {
    return null;
  }
  return value;
};

const extractBearer = (req: Request): string | null => {
  const auth = req.headers.authorization;
  if (typeof auth !== "string" || !auth.startsWith("Bearer ")) return null;
  const token = auth.slice("Bearer ".length);
  return token ? token : null;
};

/**
 * Single extraction point for access tokens. The Authorization
 * header wins when present (CMS and HIMTI APP keep using Bearer);
 * otherwise the httpOnly access_token cookie is used (LMS).
 */
export const extractAccessToken = (req: Request): ExtractedToken | null => {
  const bearer = extractBearer(req);
  if (bearer) return { token: bearer, method: "bearer" };
  const cookie = readPlainCookie(req, ACCESS_TOKEN_COOKIE);
  if (cookie) return { token: cookie, method: "cookie" };
  return null;
};

/**
 * Single extraction point for refresh tokens. Same priority as the
 * access token: Bearer header first, refresh_token cookie second.
 */
export const extractRefreshToken = (req: Request): ExtractedToken | null => {
  const bearer = extractBearer(req);
  if (bearer) return { token: bearer, method: "bearer" };
  const cookie = readPlainCookie(req, REFRESH_TOKEN_COOKIE);
  if (cookie) return { token: cookie, method: "cookie" };
  return null;
};

/**
 * CSRF guard for cookie authentication: a request that authenticated
 * via cookie must carry a non-empty X-Requested-With header, which a
 * plain cross-site form or image request cannot set without a CORS
 * preflight. Bearer requests are never checked.
 */
export const hasCookieCsrfHeader = (req: Request): boolean => {
  const header = req.headers["x-requested-with"];
  const value = Array.isArray(header) ? header[0] : header;
  return typeof value === "string" && value.trim().length > 0;
};

/**
 * Sets the auth cookies from string token fields only. A missing or
 * non-string field sets nothing, so callers can pass either login
 * response shape (LMS camelCase, app/admin snake_case) and the
 * refresh cookie is only set when the service actually returned a
 * refresh token. The response body is untouched.
 */
export const setAuthCookies = (
  res: Response,
  tokens: { accessToken?: unknown; refreshToken?: unknown }
): void => {
  const secure = isProduction();
  if (typeof tokens.accessToken === "string" && tokens.accessToken) {
    res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: getAccessTokenMaxAgeMs(),
    });
  }
  if (typeof tokens.refreshToken === "string" && tokens.refreshToken) {
    res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: REFRESH_TOKEN_COOKIE_PATH,
      maxAge: REFRESH_TOKEN_MAX_AGE_MS,
    });
  }
};

/** Clears both auth cookies with the same path they were set with. */
export const clearAuthCookies = (res: Response): void => {
  const secure = isProduction();
  res.clearCookie(ACCESS_TOKEN_COOKIE, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
  });
  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: REFRESH_TOKEN_COOKIE_PATH,
  });
};
