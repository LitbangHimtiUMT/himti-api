import { NextFunction, Request, type Response } from "express";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { HandleResponse } from "../../../utils/handle-response";
import { ErrorApp } from "../../../utils/http-error";
import { MESSAGES } from "../../../utils/messages";
import {
  createSessionService,
  deleteSessionService,
  getSessionsByClassService,
  getSessionService,
  updateSessionService,
} from "./sessions.service";
import { RequestWithAccessToken } from "../../../interface/Request";

export const createSessionController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { body, params, userId } = req;
  const { classId } = params;

  const session = await createSessionService(
    {
      ...body,
      classId,
    },
    userId
  );

  if (session instanceof ErrorApp) {
    next(session);
    return;
  }

  HandleResponse(res, 201, MESSAGE_CODE.SUCCESS, MESSAGES.CREATED.SESSION);
};

export const updateSessionController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { body, params, userId } = req;
  const { sessionId } = params;

  const session = await updateSessionService(sessionId, body, userId);

  if (session instanceof ErrorApp) {
    next(session);
    return;
  }

  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.SESSIONS.UPDATE
  );
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

export const deleteSessionController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { params, userId } = req;
  const { sessionId } = params;
  const result = await deleteSessionService(sessionId, userId);
  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.MODULES.GET,
    result
  );
};