import { Router } from "express";
import { validateRequest } from "../../../middleware/validate-request";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import { upload } from "../../../utils/upload-file-to-storage";
import {
  createAssignmentController,
  getAssignmentByIdController,
  submitAssignmentController,
} from "./assignment.controller";
import { createAssignmentSchema } from "./assignment.request";
import { submissionRoute } from "./submission/submission.route";
import { checkToken } from "../../authentication/auth.controller";
import { decodeToken } from "../../../middleware/verify-token";

export const assignmentRoute = Router();

assignmentRoute
  .use("/submissions", submissionRoute)
  .post(
    "/submit",
    decodeToken,
    // verifyRole([RolesEnum.USER, RolesEnum.ANGGOTA]),
    CatchWrapper(upload.single("file")),
    CatchWrapper(submitAssignmentController)
  )
  .post(
    "/:moduleId",
    // verifyRole([RolesEnum.MENTOR]),
    validateRequest(createAssignmentSchema),
    CatchWrapper(createAssignmentController)
  )

  .get(
    "/:assignmentId",
    // verifyRole([
    //   RolesEnum.MENTOR,
    //   RolesEnum.ADMIN,
    //   RolesEnum.SUPER_ADMIN,
    //   RolesEnum.USER,
    //   RolesEnum.ANGGOTA,
    // ]),
    CatchWrapper(getAssignmentByIdController)
  );
