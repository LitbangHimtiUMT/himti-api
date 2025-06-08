import { NextFunction, Request, type Response } from "express";
import { RequestWithAccessToken } from "interface/Request";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { HandleResponse } from "../../../utils/handle-response";
import { ErrorApp } from "../../../utils/http-error";
import { MESSAGES } from "../../../utils/messages";
import {
  createClassParticipantService,
  getClassParticipantsByClassIdService,
  getParticipantsService,
} from "./class-participants.service";

export const createClassParticipantController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;
  const { body } = req;

  const classParticipant = await createClassParticipantService(
    body,
    userId as string
  );

  if (classParticipant instanceof ErrorApp) {
    next(classParticipant);
    return;
  }

  HandleResponse(
    res,
    201,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.CREATED.CLASS_PARTICIPANT
  );
};

export const getClassParticipantsByClassIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { query, params } = req;
  const { classId } = params;

  const result = await getClassParticipantsByClassIdService(classId, query);

  if (result instanceof ErrorApp) {
    next(result);
    return;
  }

  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.CLASS_PARTICIPANT.GET,
    result?.data,
    result?.meta
  );
};

export const getParticipantsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { query, params } = req;
  const { classId } = params;

  const result = await getParticipantsService(classId, query);

  if (result instanceof ErrorApp) {
    next(result);
    return;
  }

  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.CLASS_PARTICIPANT.GET,
    result,
  );
};
