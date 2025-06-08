import { Router } from "express";
import { CatchWrapper } from "../../../../utils/catch-wrapper";
import {
  approveSubmissionController,
  getSubmissionByAssignmentController,
  getSubmissionByIdController,
  rejectSubmissionController,
} from "./submission.controller";
import { verifyToken } from "../../../../middleware/verify-token";

export const submissionRoute = Router();

submissionRoute
  .use(verifyToken)
  .get("/:submissionId", CatchWrapper(getSubmissionByIdController))
  .get(
    "/assignment/:assignmentId",
    CatchWrapper(getSubmissionByAssignmentController)
  )
  .patch("/approve/:submissionId", CatchWrapper(approveSubmissionController))
  .patch("/reject/:submissionId", CatchWrapper(rejectSubmissionController));
