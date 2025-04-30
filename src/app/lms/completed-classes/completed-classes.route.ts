import { Router } from "express";
import { validateRequest } from "../../../middleware/validate-request";
import {
  RolesEnum,
  verifyRole,
  verifyToken,
} from "../../../middleware/verify-token";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import { createCompletedClassController } from "./completed-classes.controller";
import { createCompletedClassSchema } from "./completed-classes.request";

export const completedClassRoute = Router();

completedClassRoute
  .use(verifyToken)
  .post(
    "/",
    verifyRole([RolesEnum.USER, RolesEnum.ANGGOTA, RolesEnum.MENTOR]),
    validateRequest(createCompletedClassSchema),
    CatchWrapper(createCompletedClassController)
  );
