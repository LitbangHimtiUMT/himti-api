import { NextFunction, Request, type Response } from "express";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { HandleResponse } from "../../../utils/handle-response";
import { ErrorApp } from "../../../utils/http-error";
import { MESSAGES } from "../../../utils/messages";
import {
  createSessionService,
  getSessionsByClassService,
} from "./sessions.service";

export const createSessionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { body } = req;

  const session = await createSessionService(body);

  if (session instanceof ErrorApp) {
    next(session);
    return;
  }

  HandleResponse(res, 201, MESSAGE_CODE.SUCCESS, MESSAGES.CREATED.SESSION);
};

export const getSessionByClassController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { query, params } = req;
  const { classId } = params;

  const session = await getSessionsByClassService({
    ...query,
    classId,
  });

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
