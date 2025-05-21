import { Router } from "express";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import { generateCertificateController } from "./certificates.controller";
import { verifyToken } from "../../../middleware/verify-token";

export const certificateRoute = Router();

certificateRoute
.use(verifyToken)
.post(
  "/generate/:classId",
  CatchWrapper(generateCertificateController)
);
