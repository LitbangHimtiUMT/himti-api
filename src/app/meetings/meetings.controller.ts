import { NextFunction, type Request, type Response } from "express";
import { RequestWithAccessToken } from "../../interface/Request";
import { MESSAGE_CODE } from "../../utils/error-code";
import { HandleResponse } from "../../utils/handle-response";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGES } from "../../utils/messages";
import {
  createMeetingService,
  deleteMeetingService,
  getMeetingByIdService,
  getMeetingsByEventMeetingsIdService,
  getMeetingsService,
  updateMeetingService,
} from "./meetings.service";

export const createMeetingController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { body, userId } = req;

  const result = await createMeetingService(userId, body);

  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(res, 201, MESSAGE_CODE.SUCCESS, MESSAGES.CREATED.MEETING);
};

export const getMeetingByEventMeetingIdController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { eventMeetingId } = req.params;
  const { query, userId } = req;
  const result = await getMeetingsByEventMeetingsIdService(
    {
      ...query,
      eventMeetingId,
    },
    userId as string
  );

  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.MEETING.GET,
    result?.data,
    result?.meta
  );
};

export const getMeetingsController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { query } = req;
  const result = await getMeetingsService(query);

  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.MEETING.GET,
    result?.data,
    result?.meta
  );
};

export const getMeetingByIdController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;
  const { meetingId } = req.params;
  const result = await getMeetingByIdService(meetingId, userId as string);

  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.MEETING.GET,
    result
  );
};

export const updateMeetingController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { body, params } = req;
  const { meetingId } = params;

  const result = await updateMeetingService({
    ...body,
    meetingId,
  });

  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.MEETING.UPDATE
  );
};

export const deleteMeetingController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { params, userId } = req;
  const { meetingId } = params;
  const result = await deleteMeetingService(userId, meetingId as string);
  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.MEETING.DELETE
  );
};
