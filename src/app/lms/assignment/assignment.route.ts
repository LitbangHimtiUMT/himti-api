import { Router } from "express";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import { createAssignmentController } from "./assignment.controller";
import { validateRequest } from "../../../middleware/validate-request";
import { createAssignmentSchema } from "./assignment.request";
import { verifyToken } from "../../../middleware/verify-token";

export const assignmentRoute = Router();

assignmentRoute.post(
  "/:moduleId",
  verifyToken(["MENTOR"]),
  validateRequest(createAssignmentSchema),
  CatchWrapper(createAssignmentController)
);
