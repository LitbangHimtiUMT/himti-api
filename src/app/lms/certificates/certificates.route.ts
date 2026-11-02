import { Router } from "express";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import {
  generateCertificateController,
  getCertificatesController,
  getFileCertificateController,
} from "./certificates.controller";
import { verifyToken } from "../../../middleware/verify-token";
import rateLimit from "express-rate-limit";

// Public verification endpoint: by-code only, rate-limited so the
// code space cannot be brute-forced at full speed.
const certificateFileLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 60,
  message: {
    status: 429,
    message: "Too many certificate verification requests from this IP. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const certificateRoute = Router();

certificateRoute
  .get("/file", certificateFileLimiter, CatchWrapper(getFileCertificateController))
  .use(verifyToken)
  .post("/generate/:classId", CatchWrapper(generateCertificateController))
  .get("/", CatchWrapper(getCertificatesController));
