import { Router } from "express";
import { verifyToken } from "../../../middleware/verify-token";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import { createCompletedModuleSchema } from "./completed-modules.request";
import { createCompletedModuleController } from "./completed-modules.controller";
import { validateRequest } from "../../../middleware/validate-request";

export const completedModuleRoute = Router();

completedModuleRoute.post(
  "/",
  verifyToken(["USER", "ANGGOTA", "MENTOR"]),
  validateRequest(createCompletedModuleSchema),
  CatchWrapper(createCompletedModuleController),
);
