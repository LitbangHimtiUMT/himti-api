import { NextFunction, Response } from "express";
import { RequestWithAccessToken } from "../../../../interface/Request";
import { getSubmissionByIdService } from "./submission.service";
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