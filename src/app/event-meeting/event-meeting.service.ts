import { deleteMeetingManyByEventMeetingId } from "../meetings/meetings.repository";
import { Query } from "../../interface/Query";
import { MESSAGE_CODE } from "../../utils/error-code";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGES } from "../../utils/messages";
import { Meta } from "../../utils/meta";
import {
  CreateEventMeetingBodyRequest,
  UpdateEventMeetingRequest,
} from "./event-meeting.dto";
import {
  EventMeetingData,
  eventMeetingsDTOMapper,
  getEventMeetingWithMeetingDTOMapper,
} from "./event-meeting.mapper";
import {
  createEventMeeting,
  deleteEventMeeting,
  getEventMeetingById,
  getEventMeetingByName,
  getEventMeetings,
  getEventMeetingsCount,
  updateEventMeeting,
} from "./event-meeting.repository";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";
import { historyCreateFlag, historyDeleteFlag } from "../history/history.repository";
import { HistoryModule } from "@prisma/client";

export const createEventMeetingService = async (
  createdBy: string,
  body: CreateEventMeetingBodyRequest
) => {
  const eventMeeting = await getEventMeetingByName(body?.name ?? "");
  if (eventMeeting) {
    return new ErrorApp(
      MESSAGES.ERROR.ALREADY.EVENT_MEETING,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  const data = await createEventMeeting(body?.name ?? "", body?.description);
  await historyCreateFlag({
    module: HistoryModule.EVENT_MEETING,
    title: `New Event Meeting - ${body}`,
    actionId: data.id,
    createdBy,
  });
  return data;
};
export const updateEventMeetingService = async (
  body: UpdateEventMeetingRequest
) => {
  const eventMeeting = await getEventMeetingById(body.eventMeetingId);
  if (!eventMeeting) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.EVENT_MEETING,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  const duplicate = await getEventMeetingByName(body.name ?? "");
  if (duplicate) {
    return new ErrorApp(
      MESSAGES.ERROR.ALREADY.EVENT_MEETING,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  const data = await updateEventMeeting({
    eventMeetingId: eventMeeting.id,
    description: body.description,
    name: body.name,
  });

  return data;
};

export const getEventMeetingsService = async (query: Query) => {
  const { page = "1", perPage = "10" } = query;
  const [eventMeetings, totalData] = await Promise.all([
    getEventMeetings(query),
    getEventMeetingsCount(query),
  ]);

  const meta = Meta(Number(page), Number(perPage), totalData);

  const data = eventMeetingsDTOMapper(eventMeetings as EventMeetingData[]);

  return {
    data,
    meta,
  };
};

export const getEventMeetingWithMeetingService = async (
  query: Query,
  userId: string
) => {
  const { page = "1", perPage = "10" } = query;
  const [eventMeetings, totalData] = await Promise.all([
    getEventMeetings(query, userId),
    getEventMeetingsCount(query),
  ]);

  const meta = Meta(Number(page), Number(perPage), totalData);

  const data = getEventMeetingWithMeetingDTOMapper(
    eventMeetings as EventMeetingData[],
    userId
  );

  return {
    data,
    meta,
  };
};

export const getEventMeetingByIdService = async (eventMeetingId: string) => {
  const eventMeeting = await getEventMeetingById(eventMeetingId);
  if (!eventMeeting) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.EVENT_MEETING,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  return eventMeeting;
};

export const deleteEventMeetingService = async (createdBy: string, eventMeetingId: string) => {
  const eventMeeting = await getEventMeetingById(eventMeetingId);
  if (!eventMeeting) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.EVENT_MEETING,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  const [deleteMeeting, deleteEM] = await Promise.all([
    deleteMeetingManyByEventMeetingId(eventMeeting.id),
    deleteEventMeeting(eventMeeting.id),
  ]);

  const errValidation =
    deleteEM instanceof PrismaClientValidationError ||
    deleteMeeting instanceof PrismaClientValidationError;
  const errRequest =
    deleteEM instanceof PrismaClientKnownRequestError ||
    deleteMeeting instanceof PrismaClientKnownRequestError;

  if (errValidation || errRequest) {
    return new ErrorApp(
      MESSAGES.ERROR.FAILED.EVENT_MEETING,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  await historyDeleteFlag({
    module: HistoryModule.EVENT_MEETING,
    title: `Delete Event Meeting - ${eventMeeting.name}`,
    actionId: eventMeeting.id,
    createdBy,
  });
  return true;
};
