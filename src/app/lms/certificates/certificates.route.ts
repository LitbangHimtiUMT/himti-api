import { Router } from "express";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import {
  generateCertificateController,
  getCertificatesController,
  getFileCertificateController,
} from "./certificates.controller";
import { verifyToken } from "../../../middleware/verify-token";

export const certificateRoute = Router();

certificateRoute
  .get("/file", CatchWrapper(getFileCertificateController))
  .use(verifyToken)
  .post("/generate/:classId", CatchWrapper(generateCertificateController))
  .get("/", CatchWrapper(getCertificatesController));
