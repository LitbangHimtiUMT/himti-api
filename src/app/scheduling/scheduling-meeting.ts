import { UserFCM } from "@prisma/client";
import { Request, Response } from "express";
import { SendFirebaseNotification } from "../../utils/firebase-config";
import { formatTime } from "../../utils/format-time";
import { NotificationMessage } from "../../utils/notification-message";
import { getMeetingToday } from "../meetings/meetings.repository";
import { createManyNotification } from "../notification/notification.repository";
import { getAllMemberFCMUser } from "../user-fcm/user-fcm.repository";

export const schedulingNotification = async (req: Request, res: Response) => {
  const meetingToday = await getMeetingToday();
  if (meetingToday) {
    const fcm = await getAllMemberFCMUser({
      page: "1",
      perPage: "99999",
    });

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

    if (fcm.length) {
      for (const item of fcm) {
        const message = NotificationMessage(
          `Pengingat Rapat: ${meetingToday.name}`,
          `Hallo sobat informatika, hari ini kami akan mengadakan rapat ${meetingToday.name} yang akan dilaksanakan pada ${formatTime(meetingToday.startTime)} - ${formatTime(meetingToday.endTime)}. Kehadiranmu sangat dinantikan :)`,
          item.fcmToken
        );

        await SendFirebaseNotification(message);
      }

      const unique = fcmUnique();
      await createManyNotification(
        unique.map((item) => ({
          body: meetingToday.description ?? "",
          title: meetingToday.name,
          meetingId: meetingToday.id,
          userId: item.userId,
        }))
      );
    }
  }
  console.log("running a task job");
  return res.json({
    message: "success",
  });
};
