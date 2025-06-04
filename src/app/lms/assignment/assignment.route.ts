import { Router } from "express";
import { validateRequest } from "../../../middleware/validate-request";
import { RolesEnum, verifyRole } from "../../../middleware/verify-token";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import {
  createAssignmentController,
  getAssignmentByIdController,
  submitAssignmentController,
} from "./assignment.controller";
import { createAssignmentSchema } from "./assignment.request";
import { upload } from "../../../utils/upload-file-to-storage";
import { submissionRoute } from "./submission/submission.route";

export const assignmentRoute = Router();

assignmentRoute
  .use("/submissions", submissionRoute)
  .post(
    "/submit",
    verifyRole([RolesEnum.USER, RolesEnum.ANGGOTA]),
    CatchWrapper(upload.single("file")),
    CatchWrapper(submitAssignmentController)
  )
  .post(
    "/:moduleId",
    verifyRole([RolesEnum.MENTOR]),
    validateRequest(createAssignmentSchema),
    CatchWrapper(createAssignmentController)
  )

  .get(
    "/:assignmentId",
    verifyRole([
      RolesEnum.MENTOR,
      RolesEnum.ADMIN,
      RolesEnum.SUPER_ADMIN,
      RolesEnum.USER,
      RolesEnum.ANGGOTA,
    ]),
    CatchWrapper(getAssignmentByIdController)
  );
