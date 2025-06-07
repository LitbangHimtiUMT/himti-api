import { NextFunction, Response } from "express";
import { RequestWithAccessToken } from "../../../../interface/Request";
import { approveSubmissionService, getSubmissionByAssignmentService, getSubmissionByIdService, rejectSubmissionService } from "./submission.service";
import { ErrorApp } from "../../../../utils/http-error";
import { HandleResponse } from "../../../../utils/handle-response";
import { MESSAGE_CODE } from "../../../../utils/error-code";
import { MESSAGES } from "../../../../utils/messages";

export const getSubmissionByIdController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { params } = req;
  const { submissionId } = params;
  const result = await getSubmissionByIdService(submissionId);
  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.ASSIGNMENT.GET,
    result
  );
};

export const getSubmissionByAssignmentController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { params } = req;
  const { assignmentId } = params;
  const result = await getSubmissionByAssignmentService(assignmentId);
  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.SUBMISSION.GET,
    result
  );
};

export const rejectSubmissionController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { params, userId } = req;
  const { submissionId } = params;
  const result = await rejectSubmissionService(submissionId, userId);
  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.SUBMISSION.REJECT,
    result
  );
};

export const approveSubmissionController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { params, userId } = req;
  const { submissionId } = params;
  const result = await approveSubmissionService(submissionId, userId);
  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.SUBMISSION.APPROVE,
    result
  );
};

