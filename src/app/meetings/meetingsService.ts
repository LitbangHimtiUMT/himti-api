import { Query } from "../../interface/Query";
import { MESSAGE_CODE } from "../../utils/error-code";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGES } from "../../utils/messages";
import { Meta } from "../../utils/meta";
import { getEventMeetingById } from "../eventMeeting/eventMeetingRepository";
import {
  CreateMeetingBodyRequest,
  FilterMeeting,
  UpdateMeetingBodyRequest,
} from "./meetingsDTO";
import {
  MeetingData,
  getMeetingDTOMapper,
  getMeetingsDTOMapper,
  meetingsDTOMapper,
} from "./meetingsMapper";
import {
  createMeeting,
  deleteMeeting,
  getMeetingByEventMeetingId,
  getMeetingById,
  getMeetings,
  getMeetingsByEventMeetingId,
  getMeetingsByEventMeetingIdCount,
  getMeetingsCount,
  updateMeeting,
} from "./meetingsRepository";

export const createMeetingService = async (body: CreateMeetingBodyRequest) => {
  const eventMeeting = await getEventMeetingById(body.eventMeetingId);

  if (!eventMeeting) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.EVENT_MEETING,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  const meeting = await getMeetingByEventMeetingId(
    body.eventMeetingId,
    body.name
  );

  if (meeting?.name === body.name) {
    return new ErrorApp(
      MESSAGES.ERROR.ALREADY.MEETING,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  const timeNotValid =
    new Date(body.startTime as Date) < new Date(body.endTime as Date);

  if (!timeNotValid) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.TIME,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  const data = await createMeeting({
    ...body,
    startTime: new Date(body.startTime as Date),
    endTime: new Date(body.endTime as Date),
  });

  // const fcmUnique = () => {
  //   const map = new Map();
  //   const userFcm = fcm.map((userFcm) => ({
  //     id: userFcm.id,
  //     fcmToken: userFcm.fcmToken,
  //     userId: userFcm.userId,
  //   }));
  //   userFcm.forEach((item) => map.set(item.userId, item));
  //   return Array.from(map.values()) as UserFCM[];
  // };

  // const fcm = await getAllMemberFCMUser({
  //   page: "1",
  //   perPage: "99999",
  // });
  // if (fcm.length) {
  //   for (const item of fcm) {
  //     const message = NotificationMessage(
  //       data.name,
  //       data.description ?? "",
  //       item.fcmToken
  //     ) as FirebaseNotificationMessage;

  //     SendFirebaseNotification(message)
  //       .then(() => {})
  //       .catch((err) => {
  //         if (err) {
  //           return;
  //         }
  //       });
  //   }

  //   const unique = fcmUnique();
  //   for (const item of unique) {
  //     await createNotification({
  //       body: data.description ?? "",
  //       title: data.name,
  //       meetingId: data.id,
  //       userId: item.userId,
  //     });
  //   }
  // }

  return data;
};

export const updateMeetingService = async (body: UpdateMeetingBodyRequest) => {
  const meeting = await getMeetingById(body.meetingId);
  if (!meeting) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.MEETING,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  const alreadyMeeting = await getMeetingByEventMeetingId(
    meeting.eventMeetingId,
    body?.name || ""
  );
  console.log({
    alreadyMeeting,
    meeting,
  });
  if (alreadyMeeting && alreadyMeeting.id !== meeting.id) {
    return new ErrorApp(
      MESSAGES.ERROR.ALREADY.MEETING,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  if (body.startTime && !body.endTime) {
    const timeNotValid =
      new Date(body.startTime as Date) < new Date(meeting.endTime as Date);
    if (!timeNotValid) {
      return new ErrorApp(
        MESSAGES.ERROR.INVALID.TIME,
        400,
        MESSAGE_CODE.BAD_REQUEST
      );
    }
  } else if (!body.startTime && body.endTime) {
    const timeNotValid =
      new Date(body.endTime as Date) > new Date(meeting.startTime as Date);
    if (!timeNotValid) {
      return new ErrorApp(
        MESSAGES.ERROR.INVALID.TIME,
        400,
        MESSAGE_CODE.BAD_REQUEST
      );
    }
  } else if (body.startTime && body.endTime) {
    const timeNotValid =
      new Date(body.startTime as Date) < new Date(body.endTime as Date);
    if (!timeNotValid) {
      return new ErrorApp(
        MESSAGES.ERROR.INVALID.TIME,
        400,
        MESSAGE_CODE.BAD_REQUEST
      );
    }
  }

  const data = await updateMeeting({
    ...body,
    startTime: new Date(body.startTime as Date),
    endTime: new Date(body.endTime as Date),
  });
  return data;
};

export const getMeetingsByEventMeetingsIdService = async (
  query: FilterMeeting,
  userId: string
) => {
  const { page = "1", perPage = "10" } = query;
  const [meetings, totalData] = await Promise.all([
    getMeetingsByEventMeetingId(query),
    getMeetingsByEventMeetingIdCount(query),
  ]);

  const meta = Meta(Number(page), Number(perPage), totalData);
  const data = meetingsDTOMapper(meetings as MeetingData[], userId);

  return {
    data,
    meta,
  };
};

export const getMeetingsService = async (query: Query) => {
  const { page = "1", perPage = "10" } = query;
  const [meetings, totalData] = await Promise.all([
    getMeetings(query),
    getMeetingsCount(query),
  ]);

  const meta = Meta(Number(page), Number(perPage), totalData);

  const data = getMeetingsDTOMapper(meetings as MeetingData[]);

  return {
    data,
    meta,
  };
};

export const getMeetingByIdService = async (
  meetingId: string,
  userId: string
) => {
  const meeting = await getMeetingById(meetingId);

  if (!meeting) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.MEETING,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  const data = getMeetingDTOMapper(meeting as MeetingData, userId);

  return data;
};

export const deleteMeetingService = async (meetingId: string) => {
  const meeting = await getMeetingById(meetingId);
  if (!meeting) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.MEETING,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  if (meeting.Attendance.length > 0) {
    return new ErrorApp(
      MESSAGES.ERROR.RELATION.MEETING,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  const data = await deleteMeeting(meetingId);
  return data;
};
