import { Router } from "express";
import { validateRequest } from "../../middleware/validate-request";
import { verifyToken } from "../../middleware/verify-token";
import { CatchWrapper } from "../../utils/catch-wrapper";
import {
  checkToken,
  forgotPasswordController,
  loginAdminController,
  loginController,
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

// Brute-force guard for credential endpoints. Kept separate from the
// OTP limiter (3/15 min) because login/register are hit far more
// often by legitimate users, and a shared-IP (campus NAT) must not
// lock out a whole building after a handful of logins.
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    status: 429,
    message: "Terlalu banyak percobaan login dari IP ini. Silakan coba lagi dalam 15 menit.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Refresh is called by LMS on profile/auth flows; a tighter login
// limit would break legitimate refresh bursts, so it gets its own
// higher ceiling. It still stops unbounded token-minting loops.
const refreshRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: 429,
    message: "Terlalu banyak permintaan refresh token dari IP ini. Silakan coba lagi dalam 15 menit.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const route = Router();

route.post(
  "/register",
  authRateLimiter,
  validateRequest(registerSchema),
  CatchWrapper(registerController)
);
route.post(
  "/login",
  authRateLimiter,
  validateRequest(loginSchema),
  CatchWrapper(loginController)
);
route.post(
  "/admin/login",
  authRateLimiter,
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
  authRateLimiter,
  validateRequest(forgotPasswordSchema),
  CatchWrapper(forgotPasswordController)
);
// Biometric login DISABLED in Fase 2: it issued a token from a
// decrypted email alone, with no password or second factor, and no
// second-factor decision exists yet. The service stays in the code
// but is unreachable over HTTP; re-enable only with a real second
// factor, as a deliberate decision. Clients calling this get 410.
route.post("/biometric", (_req, res) => {
  res.status(410).json({
    status: 410,
    message: "Biometric login is disabled",
  });
});
route.get("/logout", VerifyTokenWithoutExp, CatchWrapper(logoutController));
route.get("/token", verifyToken, CatchWrapper(checkToken));
route.post(
  "/refresh-token",
  refreshRateLimiter,
  CatchWrapper(refreshTokenController)
);

export default route;
