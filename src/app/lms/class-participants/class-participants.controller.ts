import { NextFunction, Request, type Response } from "express";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { HandleResponse } from "../../../utils/handle-response";
import { ErrorApp } from "../../../utils/http-error";
import { MESSAGES } from "../../../utils/messages";
import { createClassParticipantService } from "./class-participants.service";
import { RequestWithAccessToken } from "interface/Request";

export const createClassParticipantController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req;
  const { body } = req;

  const classParticipant = await createClassParticipantService(
    body,
    userId as string,
  );

  if (classParticipant instanceof ErrorApp) {
    next(classParticipant);
    return;
  }

  HandleResponse(
    res,
    201,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.CREATED.CLASS_PARTICIPANT,
  );
};
