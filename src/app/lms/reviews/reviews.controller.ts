import { NextFunction, Response } from "express";
import { RequestWithAccessToken } from "../../../interface/Request";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { HandleResponse } from "../../../utils/handle-response";
import { ErrorApp } from "../../../utils/http-error";
import { MESSAGES } from "../../../utils/messages";
import {
  createReviewService,
  getClassReviewsService,
} from "./reviews.service";

export const getClassReviewsController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { params, query, userId } = req;
  const { classId } = params;

  // optionalAuth leaves userId unset for guests; the service treats
  // an absent identity as anonymous and returns no personal state.
  const result = await getClassReviewsService(classId, query, userId);
  if (result instanceof ErrorApp) {
    next(result);
    return;
  }

  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.REVIEW.GET,
    result.data,
    result.meta
  );
};

export const createReviewController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { body, userId } = req;

  // Whitelist: only the validated fields cross into the service, and
  // the author always comes from the verified token — a userId in the
  // body is ignored, so nobody can review as someone else.
  const result = await createReviewService(
    {
      classId: body.classId,
      rating: body.rating,
      text: body.text,
    },
    userId ?? ""
  );
  if (result instanceof ErrorApp) {
    next(result);
    return;
  }

  HandleResponse(
    res,
    201,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.REVIEW.CREATE,
    result
  );
};
