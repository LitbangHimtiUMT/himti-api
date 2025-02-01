import { Router } from "express";
import { verifyToken } from "../../../middleware/verify-token";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import { createSessionSchema } from "./sessions.request";
import { createSessionController } from "./sessions.controller";
import { validateRequest } from "../../../middleware/validate-request";

export const sessionRoute = Router();

sessionRoute.post(
  "/",
  verifyToken(["MENTOR", "SUPER_ADMIN", "ADMIN"]),
  validateRequest(createSessionSchema),
  CatchWrapper(createSessionController),
);
