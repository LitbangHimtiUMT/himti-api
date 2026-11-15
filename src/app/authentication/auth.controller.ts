import { NextFunction, type Request, type Response } from "express";
import { MESSAGE_CODE } from "../../utils/error-code";
import { HandleResponse } from "../../utils/handle-response";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGES } from "../../utils/messages";
import { LoginAuthResponse } from "./auth.dto";
import { RequestWithAccessToken } from "../../interface/Request";
import {
  forgotPasswordService,
  loginAdminService,
  loginService,
  logoutService,
  refreshTokenService,
  registerService,
  requestOtpService,
  validateOtpService,
} from "./auth.service";
import {
  clearAuthCookies,
  extractRefreshToken,
  setAuthCookies,
} from "../../utils/auth-cookies";

/**
 * Login results come in two shapes: LMS returns
 * { accessToken, refreshToken }, while app and admin login return
 * { access_token, ... } with no refresh token. Only string fields
 * that actually exist become cookies; the response body is untouched.
 */
const setCookiesFromLoginResult = (res: Response, login: unknown): void => {
  const tokens = login as Record<string, unknown>;
  setAuthCookies(res, {
    accessToken: tokens.accessToken ?? tokens.access_token,
    refreshToken: tokens.refreshToken,
  });
};

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, email, password, nim, code } = req.body;

  const register = await registerService(
    { name, email, password, nim, code },
    req.query
  );

  if (register instanceof ErrorApp) {
    next(register);
    return;
  }
  HandleResponse(res, 201, MESSAGE_CODE.SUCCESS, MESSAGES.CREATED.USER.ACCOUNT);
};

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // const { email, password } = req.body
  const { body, query } = req;

  const login = await loginService(body, query);
  if (login instanceof ErrorApp) {
    next(login);
    return;
  }
  setCookiesFromLoginResult(res, login);
  HandleResponse<LoginAuthResponse>(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.USER,
    login as LoginAuthResponse
  );
};

export const loginAdminController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  const login = await loginAdminService({ email, password });
  if (login instanceof ErrorApp) {
    next(login);
    return;
  }
  // Admin login has no refresh token, so only the access cookie is set.
  setCookiesFromLoginResult(res, login);
  HandleResponse(res, 200, MESSAGE_CODE.SUCCESS, MESSAGES.SUCCESS.USER, login);
};

export const requestOtpController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;
  const otp = await requestOtpService(email as string);

  if (otp instanceof ErrorApp) {
    next(otp);
    return;
  }

  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.OTP.SEND,
    otp
  );
};

export const validateOtpController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { key, otp } = req.body;

  const otps = await validateOtpService({ key, otp });

  if (otps instanceof ErrorApp) {
    next(otps);
    return;
  }

  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.OTP.VERIFY,
    otps
  );
};

export const forgotPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { key, password } = req.body;
  const forgot = await forgotPasswordService({ key, password });

  if (forgot instanceof ErrorApp) {
    next(forgot);
    return;
  }

  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.PASSWORD.CHANGE
  );
};

export const logoutController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  // Clear both cookies with the same paths they were set with, then
  // run the existing logout (FCM cleanup). The body is untouched.
  clearAuthCookies(res);
  const logout = await logoutService(req.userId as string);

  if (logout instanceof ErrorApp) {
    next(logout);
    return;
  }

  HandleResponse(res, 200, MESSAGE_CODE.SUCCESS, MESSAGES.SUCCESS.LOGOUT);
};

export const checkToken = async (req: Request, res: Response) => {
  HandleResponse(res, 200, MESSAGE_CODE.SUCCESS, MESSAGES.SUCCESS.TOKEN);
};

export const refreshTokenController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Refresh accepts a Bearer token (CMS, HIMTI APP) or the
  // path-restricted refresh_token cookie (LMS). No token at all
  // reaches the service as "", which it already rejects with 401.
  const extracted = extractRefreshToken(req);
  const result = await refreshTokenService(extracted?.token ?? "");

  if (result instanceof ErrorApp) {
    next(result);
    return;
  }

  setAuthCookies(res, result);
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.REFRESH_TOKEN.GET,
    result
  );
};
