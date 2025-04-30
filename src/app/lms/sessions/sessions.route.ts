import { Router } from "express";
import {
  RolesEnum,
  verifyRole,
  verifyToken,
} from "../../../middleware/verify-token";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import { createSessionSchema } from "./sessions.request";
import {
  createSessionController,
  getSessionByClassController,
} from "./sessions.controller";
import { validateRequest } from "../../../middleware/validate-request";

export const sessionRoute = Router();

sessionRoute
  .use(verifyToken)
  .post(
    "/:classId",
    verifyRole([RolesEnum.MENTOR, RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN]),
    validateRequest(createSessionSchema),
    CatchWrapper(createSessionController)
  )
  .get(
    "/class/:classId",
    verifyRole([
      RolesEnum.MENTOR,
      RolesEnum.SUPER_ADMIN,
      RolesEnum.ADMIN,
      RolesEnum.USER,
      RolesEnum.ANGGOTA,
    ]),
    CatchWrapper(getSessionByClassController)
  );
