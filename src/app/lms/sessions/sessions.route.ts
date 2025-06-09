import { Router } from "express";
import {
  RolesEnum,
  verifyRole,
  verifyToken,
} from "../../../middleware/verify-token";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import { createSessionSchema, updateSessionSchema } from "./sessions.request";
import {
  createSessionController,
  getSessionByClassController,
  getSessionController,
  updateSessionController,
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
  .put(
    "/:sessionId",
    verifyRole([RolesEnum.MENTOR, RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN]),
    validateRequest(updateSessionSchema),
    CatchWrapper(updateSessionController)
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
  )
  .get("/:sessionId", CatchWrapper(getSessionController));
