import { NextFunction, Response } from "express";
import { RequestWithAccessToken } from "../../../interface/Request";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { HandleResponse } from "../../../utils/handle-response";
import { ErrorApp } from "../../../utils/http-error";
import { MESSAGES } from "../../../utils/messages";
import {
  createAssignmentService,
  getAssignmentByIdService,
  submitAssignmentService,
} from "./assignment.service";
import { submitAssignmentSchema } from "./assignment.request";

export const createAssignmentController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { body, params, userId } = req;
  const { moduleId } = params;
  const result = await createAssignmentService(moduleId, body, userId ?? "");
  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(res, 201, MESSAGE_CODE.SUCCESS, MESSAGES.CREATED.ASSIGNMENT);
};

export const getAssignmentByIdController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { params, userId } = req;
  const { assignmentId } = params;
  const result = await getAssignmentByIdService(assignmentId, userId);
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

export const submitAssignmentController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const file = req.file as Express.Multer.File;
  const { userId } = req;
  const { body } = req;
  const combine = {
    ...body,
    file,
  };

  const validate = submitAssignmentSchema.validate(combine);
  if (validate.error) {
    next(
      new ErrorApp(
        validate.error.message.replace(/"/g, ""),
        400,
        MESSAGE_CODE.BAD_REQUEST
      )
    );
    return;
  }

  const classCtrl = await submitAssignmentService({
    ...combine,
    submittedBy: userId
  });

  if (classCtrl instanceof ErrorApp) {
    next(classCtrl);
    return;
  }

  HandleResponse(res, 201, MESSAGE_CODE.SUCCESS, MESSAGES.CREATED.CLASS);
};