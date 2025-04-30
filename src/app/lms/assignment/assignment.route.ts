import { Router } from "express";
import { validateRequest } from "../../../middleware/validate-request";
import { RolesEnum, verifyRole } from "../../../middleware/verify-token";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import { createAssignmentController } from "./assignment.controller";
import { createAssignmentSchema } from "./assignment.request";

export const assignmentRoute = Router();

assignmentRoute.post(
  "/:moduleId",
  verifyRole([RolesEnum.MENTOR]),
  validateRequest(createAssignmentSchema),
  CatchWrapper(createAssignmentController)
);
