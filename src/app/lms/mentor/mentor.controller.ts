import { NextFunction, Request, Response } from "express";
import {
  createMentorService,
  deleteMentorService,
  getMentorByIdService,
  getMentorsService,
} from "./mentor.service";
import { ErrorApp } from "../../../utils/http-error";
import { HandleResponse } from "../../../utils/handle-response";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { MESSAGES } from "../../../utils/messages";

export const createMentorController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;
  const result = await createMentorService(userId, req.body);

  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(res, 201, MESSAGE_CODE.CREATED, MESSAGES.CREATED.MENTOR);
};

export const getMentorsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { query } = req;
  console.log("HAHAHAH");
  const result = await getMentorsService(query);
  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.MENTOR.GET,
    result?.data,
    result?.meta
  );
};

export const deleteMentorController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { mentorId } = req.params;
  const result = await deleteMentorService(mentorId);

  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.MENTOR.DELETE
  );
};

export const getMentorByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { mentorId } = req.params;
  const result = await getMentorByIdService(mentorId);

  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.MENTOR.GET,
    result
  );
};
