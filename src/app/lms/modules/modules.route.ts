import { Router } from "express";
import { verifyToken } from "../../../middleware/verify-token";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import { createModuleSchema } from "./modules.request";
import {
  createModuleController,
  getModulesController,
} from "./modules.controller";
import { validateRequest } from "../../../middleware/validate-request";

export const moduleRoute = Router();

moduleRoute
  .post(
    "/",
    verifyToken(["MENTOR", "SUPER_ADMIN", "ADMIN"]),
    validateRequest(createModuleSchema),
    CatchWrapper(createModuleController)
  )
  .get("/session/:sessionId", CatchWrapper(getModulesController));
