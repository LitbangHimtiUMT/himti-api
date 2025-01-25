import { prisma } from "../../config";
import { NotificationBodyRequest } from "./notification.dto";

export const createNotification = async ({
  body,
  title,
  eventId,
  meetingId,
  userId,
}: NotificationBodyRequest) => {
  return await prisma.notificationHistory.create({
    data: {
      title,
      body,
      eventId: eventId ? eventId : null,
      isRead: false,
      meetingId: meetingId ? meetingId : null,
      userId: userId as string,
    },
    select: {
      id: true,
      title: true,
      body: true,
    },
  });
};

export const createManyNotification = async (
  data: NotificationBodyRequest[]
) => {
  return await prisma.notificationHistory.createMany({
    data: data.map((item) => ({
      title: item.title,
      body: item.body,
      eventId: item.eventId ? item.eventId : null,
      isRead: false,
      meetingId: item.meetingId ? item.meetingId : null,
      userId: item.userId as string,
    })),
  });
};

export const getNotifications = async (userId: string) => {
  return await prisma.notificationHistory.findMany({
    where: {
      userId,
    },
    include: {
      Event: {
        select: {
          id: true,
          name: true,
        },
      },
      Meeting: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getNotificationById = async (notificationId: string) => {
  return await prisma.notificationHistory.findUnique({
    where: {
      id: notificationId,
    },
    select: {
      id: true,
      userId: true,
      isRead: true,
    },
  });
};

export const updateStatusNotification = async (
  notificationId: string,
  status: boolean
) => {
  return await prisma.notificationHistory.update({
    where: {
      id: notificationId,
    },
    data: {
      isRead: status,
    },
    select: {
      id: true,
      isRead: true,
    },
  });
};
