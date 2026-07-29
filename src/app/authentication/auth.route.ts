import { Router } from "express";
import { validateRequest } from "../../middleware/validate-request";
import { verifyToken } from "../../middleware/verify-token";
import { CatchWrapper } from "../../utils/catch-wrapper";
import {
  checkToken,
  forgotPasswordController,
  loginAdminController,
  loginController,
  loginWithEncrypt,
  logoutController,
  refreshTokenController,
  registerController,
  requestOtpController,
  validateOtpController,
} from "./auth.controller";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  requestOtpSchema,
  validateOtpSchema,
} from "./auth.request";
import { VerifyTokenWithoutExp } from "../../middleware/verify-token-without-exp";

import rateLimit from "express-rate-limit";

const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 3, // Maksimal 3 permintaan per IP address per windowMs
  message: {
    status: 429,
    message: "Terlalu banyak permintaan OTP dari IP ini. Silakan coba lagi dalam 15 menit.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const route = Router();

route.post(
  "/register",
  validateRequest(registerSchema),
  CatchWrapper(registerController)
);
route.post(
  "/login",
  validateRequest(loginSchema),
  CatchWrapper(loginController)
);
route.post(
  "/admin/login",
  validateRequest(loginSchema),
  CatchWrapper(loginAdminController)
);
route.post(
  "/otp",
  otpRateLimiter,
  validateRequest(requestOtpSchema),
  CatchWrapper(requestOtpController)
);
route.post(
  "/otp/validate",
  validateRequest(validateOtpSchema),
  CatchWrapper(validateOtpController)
);
route.put(
  "/forgot-password",
  validateRequest(forgotPasswordSchema),
  CatchWrapper(forgotPasswordController)
);
route.post("/biometric", CatchWrapper(loginWithEncrypt));
route.get("/logout", VerifyTokenWithoutExp, CatchWrapper(logoutController));
route.get("/token", verifyToken, CatchWrapper(checkToken));
route.post("/refresh-token", CatchWrapper(refreshTokenController));

export default route;
