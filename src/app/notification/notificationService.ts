import { Role, UserFCM } from "@prisma/client";
import { FirebaseNotificationMessage } from "../../interface/FirebaseNotificationMessage";
import { MESSAGE_CODE } from "../../utils/error-code";
import {
  SendFirebaseNotification,
  firebase,
} from "../../utils/firebase-config";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGES } from "../../utils/messages";
import { NotificationMessage } from "../../utils/notification-message";
import { getUserById } from "../authentication/authRepository";
import { getEventById } from "../event/eventRepository";
import { getAllFCMUser, getFCMUserById } from "../user-fcm/user-fcm.repository";
import { NotificationBodyRequest } from "./notificationDTO";
import {
  NotificationData,
  getNotificationDTOMapper,
} from "./notificationMapper";
import {
  createNotification,
  getNotificationById,
  getNotifications,
  updateStatusNotification,
} from "./notificationRepository";
import { getEventMeetingById } from "../eventMeeting/eventMeetingRepository";
import { getMeetingById } from "../meetings/meetingsRepository";

export const sendNotificationService = async (
  title: string = "testing title notification",
  body: string = "testing body notification",
  eventId?: string,
  meetingId?: string
) => {
  const fcm = await getAllFCMUser({
    page: "1",
    perPage: "99999",
  });

  if (!fcm.length) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.USER.FCM_USER,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  if (meetingId) {
    const sub = await getMeetingById(meetingId);
    if (!sub) {
      return new ErrorApp(
        MESSAGES.ERROR.NOT_FOUND.EVENT_MEETING,
        404,
        MESSAGE_CODE.NOT_FOUND
      );
    }
  }
  const fcmUnique = () => {
    const map = new Map();
    const userFcm = fcm.map((userFcm) => ({
      id: userFcm.id,
      fcmToken: userFcm.fcmToken,
      userId: userFcm.userId,
    }));
    userFcm.forEach((item) => map.set(item.userId, item));
    return Array.from(map.values()) as UserFCM[];
  };

  await Promise.all(
    fcm.map(async (item) => {
      const message = NotificationMessage(
        title,
        body,
        item.fcmToken
      ) as FirebaseNotificationMessage;
      const user = await getUserById(item.userId);
      if (user?.role === "USER" && meetingId) {
        return;
      }
      await SendFirebaseNotification(message);
    })
  );

  const unique = fcmUnique();
  for (const item of unique) {
    await createNotification({
      body,
      title,
      eventId: eventId ? eventId : undefined,
      meetingId: meetingId ? meetingId : undefined,
      userId: item.userId,
    });
  }

  console.log("Successfully sent message:");
  return null;
};

export const sendSingleNotificationService = async (
  title: string = "testing title notification",
  body: string = "testing body notification",
  token?: string
) => {
  try {
    if (!token || typeof token !== "string") {
      return new ErrorApp(
        MESSAGES.ERROR.REQUIRED.FCM_TOKEN,
        400,
        MESSAGE_CODE.BAD_REQUEST
      );
    }
    const message = NotificationMessage(title, body, token);
    const response = await firebase.messaging().send(message);
    console.log("Successfully sent message:", response);
    return message;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error sending message:", error.message);
    // res.status(500).json({ error: error.message });
    return new ErrorApp(
      error?.message ?? "Requested Entity Not Found",
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
};

export const getNotificationService = async (userId: string) => {
  const user = await getUserById(userId);
  if (!user) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.USER.ACCOUNT,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  const notification = await getNotifications(user.id);
  console.log(notification);
  const data = getNotificationDTOMapper(
    notification as NotificationData[],
    user.role as Role
  );
  const totalLength = notification.filter((e) => e.isRead === false).length;
  return {
    notification: data,
    count: totalLength,
  };
};

export const readNotificationService = async (
  notificationId: string,
  userId: string
) => {
  const notification = await getNotificationById(notificationId);
  if (!notification) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.NOTIFICATION,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  if (notification.userId !== userId) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.READ_NOTIFICATION,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  const result = await updateStatusNotification(notification.id, true);
  return result;
};

export const sendNotificationByFcmIdService = async (
  fcmId: string,
  { body, title, eventId, meetingId }: NotificationBodyRequest
) => {
  const fcm = await getFCMUserById(fcmId);
  if (!fcm) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.USER.FCM,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  if (meetingId) {
    const sub = await getEventMeetingById(meetingId);
    if (!sub) {
      return new ErrorApp(
        MESSAGES.ERROR.NOT_FOUND.SUB_ACARA,
        404,
        MESSAGE_CODE.NOT_FOUND
      );
    }
  }

  if (eventId) {
    const event = await getEventById(eventId);
    if (!event) {
      return new ErrorApp(
        MESSAGES.ERROR.NOT_FOUND.ACARA,
        404,
        MESSAGE_CODE.NOT_FOUND
      );
    }
  }

  const message = NotificationMessage(
    title,
    body,
    fcm.fcmToken
  ) as FirebaseNotificationMessage;
  await SendFirebaseNotification(message);
  return await createNotification({
    body,
    title,
    eventId: eventId ? eventId : undefined,
    meetingId: meetingId ? meetingId : undefined,
    userId: fcm.userId,
  });
};
