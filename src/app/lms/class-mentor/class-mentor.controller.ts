import { NextFunction, Response } from "express";
import { RequestWithAccessToken } from "../../../interface/Request";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { HandleResponse } from "../../../utils/handle-response";
import { ErrorApp } from "../../../utils/http-error";
import { MESSAGES } from "../../../utils/messages";
import {
  getClassMentorService,
  inviteMentorService,
} from "./class-mentor.service";

export const inviteMentorController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { userId, body } = req;
  const result = await inviteMentorService(userId, body);
  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(
    res,
    201,
    MESSAGE_CODE.CREATED,
    MESSAGES.SUCCESS.CLASS.INVITE_MENTOR
  );
};

export const getMentorByClassController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { params, query } = req;
  const result = await getClassMentorService(params?.classId, query);
  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(res, 200, MESSAGE_CODE.CREATED, MESSAGES.SUCCESS.MENTOR.GET, result);
};
