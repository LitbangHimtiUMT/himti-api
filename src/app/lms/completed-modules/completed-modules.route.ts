import { Router } from "express";
import { verifyToken } from "../../../middleware/verify-token";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import { createCompletedModuleController } from "./completed-modules.controller";

export const completedModuleRoute = Router();

completedModuleRoute.post(
  "/:moduleId",
  verifyToken(["USER", "ANGGOTA", "MENTOR"]),
  CatchWrapper(createCompletedModuleController),
);
