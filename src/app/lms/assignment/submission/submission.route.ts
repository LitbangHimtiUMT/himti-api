import { Router } from "express";
import { CatchWrapper } from "../../../../utils/catch-wrapper";
import { getSubmissionByIdController } from "./submission.controller";

export const submissionRoute = Router();

submissionRoute.get(
  "/:submissionId",
  CatchWrapper(getSubmissionByIdController)
);
