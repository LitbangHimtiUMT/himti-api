import { Router } from "express";
import { validateRequest } from "../../../middleware/validate-request";
import { verifyToken } from "../../../middleware/verify-token";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import { upload } from "../../../utils/upload-file-to-storage";
import {
  createAssignmentController,
  getAssignmentByIdController,
  submitAssignmentController,
  updateAssignmentController,
} from "./assignment.controller";
import { createAssignmentSchema } from "./assignment.request";
import { submissionRoute } from "./submission/submission.route";

export const assignmentRoute = Router();

assignmentRoute
  .use("/submissions", submissionRoute)
  .post(
    "/submit",
    verifyToken,
    // verifyRole([RolesEnum.USER, RolesEnum.ANGGOTA]),
    CatchWrapper(upload.single("file")),
    CatchWrapper(submitAssignmentController)
  )
  .post(
    "/:moduleId",
    // verifyRole([RolesEnum.MENTOR]),
    verifyToken,
    validateRequest(createAssignmentSchema),
    CatchWrapper(createAssignmentController)
  )
  .put(
    "/:assignmentId",
    // verifyRole([RolesEnum.MENTOR]),
    verifyToken,
    validateRequest(createAssignmentSchema),
    CatchWrapper(updateAssignmentController)
  )

  .get(
    "/:assignmentId",
    verifyToken,
    // verifyRole([
    //   RolesEnum.MENTOR,
    //   RolesEnum.ADMIN,
    //   RolesEnum.SUPER_ADMIN,
    //   RolesEnum.USER,
    //   RolesEnum.ANGGOTA,
    // ]),
    CatchWrapper(getAssignmentByIdController)
  );
