import { UserFCM } from "@prisma/client";
import { Request, Response } from "express";
import { SendFirebaseNotification } from "../../utils/firebase-config";
import { formatTime } from "../../utils/format-time";
import { NotificationMessage } from "../../utils/notification-message";
import { getMeetingToday } from "../meetings/meetings.repository";
import { createManyNotification } from "../notification/notification.repository";
import { getUserFCMByNIM } from "../user-fcm/user-fcm.repository";
import cron from "node-cron";
import { environment } from "../../libs";

export const schedulingNotification = async (req: Request, res: Response) => {
  const meetingToday = await getMeetingToday();
  if (meetingToday) {
    // const fcm = await getAllMemberFCMUser({
    //   page: "1",
    //   perPage: "99999",
    // });
    const fcm = await getUserFCMByNIM("2255201237");

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
          `${meetingToday.name}`,
          `Hai, Sobat HIMTI! 🚀 Jangan lupa untuk melakukan absensi online pada rapat ${meetingToday.name} dengan agenda ${meetingToday.EventMeeting.name} pada ${formatTime(meetingToday.startTime)} - ${formatTime(meetingToday.endTime)}. Absensi dapat dilakukan melalui aplikasi. Terima kasih atas partisipasinya! 💪🔥`,
          item.fcmToken
        );

        await SendFirebaseNotification(message);
      }

      const unique = fcmUnique();
      await createManyNotification(
        unique.map((item) => ({
          body: `Hai, Sobat HIMTI! 🚀 Jangan lupa untuk melakukan absensi online pada rapat ${meetingToday.name} dengan agenda ${meetingToday.EventMeeting.name} pada ${formatTime(meetingToday.startTime)} - ${formatTime(meetingToday.endTime)}. Absensi dapat dilakukan melalui aplikasi. Terima kasih atas partisipasinya! 💪🔥`,
          title: `${meetingToday.name}`,
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

export const cronSchedulingNotification = () => {
  cron.schedule(
    environment.CRON_EXPRESSION,
    async () => {
      const fcm = await getUserFCMByNIM("2255201237");
      for (const item of fcm) {
        await SendFirebaseNotification(
          NotificationMessage("ABAIKAN INI", "TESTING", item.fcmToken)
        );
      }
      console.log("running a task every 30 seconds");
    },
    {
      scheduled: true,
      timezone: "Asia/Jakarta",
    }
  );
  return true;
};
