import { Router } from "express";
import {
  RolesEnum,
  verifyRole,
  verifyToken,
} from "../../../middleware/verify-token";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import { createCompletedModuleController } from "./completed-modules.controller";

export const completedModuleRoute = Router();

completedModuleRoute
  .use(verifyToken)
  .post(
    "/:moduleId",
    verifyRole([RolesEnum.USER, RolesEnum.ANGGOTA, RolesEnum.MENTOR]),
    CatchWrapper(createCompletedModuleController)
  );
