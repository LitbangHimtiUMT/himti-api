import { NextFunction, type Response, type Request } from "express";
import {
  createEventMeetingService,
  deleteEventMeetingService,
  getEventMeetingByIdService,
  getEventMeetingWithMeetingService,
  getEventMeetingsService,
  updateEventMeetingService,
} from "./event-meeting.service";
import { ErrorApp } from "../../utils/http-error";
import { HandleResponse } from "../../utils/handle-response";
import { MESSAGE_CODE } from "../../utils/error-code";
import { MESSAGES } from "../../utils/messages";
import { RequestWithAccessToken } from "../../interface/Request";

export const createEventMeetingController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { body, userId } = req;

  const result = await createEventMeetingService(userId, body);

  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(
    res,
    201,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.CREATED.EVENT_MEETING
  );
};

export const updateEventMeetingController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { body, params } = req;
  const { eventMeetingId } = params;

  const result = await updateEventMeetingService({
    ...body,
    eventMeetingId,
  });

  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(
    res,
    201,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.EVENT_MEETING.UPDATE
  );
};

export const getEventMeetingsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { query } = req;
  const result = await getEventMeetingsService(query);

  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.EVENT_MEETING.GET,
    result?.data,
    result?.meta
  );
};

export const getEventMeetingWithMeetingController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { query, userId } = req;
  console.log({ userId });
  const result = await getEventMeetingWithMeetingService(
    query,
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
    MESSAGES.SUCCESS.EVENT_MEETING.GET,
    result?.data,
    result?.meta
  );
};

export const getEventMeetingByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { params } = req;
  const { eventMeetingId } = params;
  const result = await getEventMeetingByIdService(eventMeetingId as string);
  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.EVENT_MEETING.GET,
    result
  );
};

export const deleteEventMeetingController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { params, userId } = req;
  const { eventMeetingId } = params;
  const result = await deleteEventMeetingService(
    userId,
    eventMeetingId as string
  );

  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.EVENT_MEETING.DELETE,
    result
  );
};
