import jwt from "jsonwebtoken";
import { environment } from "../libs";
import { TokenDecodeInterface } from "../interface";

/**
 * Token helpers, single source of truth for signing keys.
 *
 * Access tokens are signed with the JWT secret (environment.JWT_SECRET).
 * Refresh tokens are signed with a derived key built from the two
 * existing env names (environment.SECRET_KEY + environment.JWT_SECRET).
 * That derivation is kept in Fase 1 on purpose: refresh tokens already
 * issued to LMS clients were signed with it, so changing the key now
 * would invalidate every live LMS session. A dedicated refresh key is
 * a Fase 4 change, together with forced re-login.
 *
 * The header secret is NO LONGER accepted as request authentication
 * anywhere (see the middleware). Its only remaining use in Fase 1 is
 * as one input to this refresh-key derivation.
 */
export const getRefreshSecret = (): string =>
  `${environment.SECRET_KEY}${environment.JWT_SECRET}`;

export const signAccessToken = (userId: string): string =>
  jwt.sign({ id: userId }, environment.JWT_SECRET as string, {
    expiresIn: environment.JWT_EXPIRES as string | number,
  });

export const signRefreshToken = (userId: string): string =>
  jwt.sign({ id: userId }, getRefreshSecret(), { expiresIn: "7d" });

/** Synchronous verification. Throws on bad signature / expiry. */
export const verifyAccessToken = (token: string): TokenDecodeInterface =>
  jwt.verify(token, environment.JWT_SECRET as string) as TokenDecodeInterface;

/** Synchronous verification against the derived refresh key. */
export const verifyRefreshToken = (token: string): TokenDecodeInterface =>
  jwt.verify(token, getRefreshSecret()) as TokenDecodeInterface;
