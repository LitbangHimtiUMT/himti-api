import { Router } from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { RequestWithAccessToken } from "../../../interface/Request";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import { verifyToken } from "../../../middleware/verify-token";
import { evaluateCourseController } from "./course.controller";

export const courseRoute = Router();

// Was fully unauthenticated. Fase 1: any authenticated user (the
// LMS participant flow). Fase 2 adds the enrolment check in the
// service (participant of that class only).
//
// Each evaluation is a paid, slow Replicate prediction, so it is
// rate-limited per authenticated user rather than per IP: the app
// sets no trust proxy, and a shared campus IP must not lock out a
// whole building. The limiter runs after verifyToken so userId is
// set and unauthenticated requests do not consume quota.
const evaluateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: {
    status: 429,
    message: "Too many evaluation requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) =>
    (req as RequestWithAccessToken).userId || ipKeyGenerator(req.ip ?? ""),
});

courseRoute.post(
  "/evaluate",
  verifyToken,
  evaluateLimiter,
  CatchWrapper(evaluateCourseController)
);
