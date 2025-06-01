import { Router } from "express";
import { validateRequest } from "../../../middleware/validate-request";
import { RolesEnum, verifyRole } from "../../../middleware/verify-token";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import { createAssignmentController, getAssignmentByIdController } from "./assignment.controller";
import { createAssignmentSchema } from "./assignment.request";

export const assignmentRoute = Router();

assignmentRoute.post(
  "/:moduleId",
  verifyRole([RolesEnum.MENTOR]),
  validateRequest(createAssignmentSchema),
  CatchWrapper(createAssignmentController)
);

assignmentRoute.get(
  "/:assignmentId",
  verifyRole([RolesEnum.MENTOR, RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN, RolesEnum.USER, RolesEnum.ANGGOTA]),
  CatchWrapper(getAssignmentByIdController)
);
