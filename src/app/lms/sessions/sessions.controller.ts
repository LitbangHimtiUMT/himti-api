import { NextFunction, Request, type Response } from "express";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { HandleResponse } from "../../../utils/handle-response";
import { ErrorApp } from "../../../utils/http-error";
import { MESSAGES } from "../../../utils/messages";
import {
  createSessionService,
  getSessionsByClassService,
  getSessionService,
} from "./sessions.service";
import { RequestWithAccessToken } from "../../../interface/Request";

export const createSessionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { body, params } = req;
  const { classId } = params;

  const session = await createSessionService({
    ...body,
    classId,
  });

  if (session instanceof ErrorApp) {
    next(session);
    return;
  }

  HandleResponse(res, 201, MESSAGE_CODE.SUCCESS, MESSAGES.CREATED.SESSION);
};

export const getSessionByClassController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { query, params, userId } = req;
  const { classId } = params;

  const session = await getSessionsByClassService(
    {
      ...query,
      classId,
    },
    userId
  );

  if (session instanceof ErrorApp) {
    next(session);
    return;
  }

  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.SESSIONS.GET,
    session?.data,
    session?.meta
  );
};

export const getSessionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { params } = req;
  const { sessionId } = params;

  const session = await getSessionService(sessionId);

  if (session instanceof ErrorApp) {
    next(session);
    return;
  }

  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.SESSIONS.GET,
    session
  );
};
