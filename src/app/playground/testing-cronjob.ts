import { Request, Response } from "express";
import { getUserFCMByNIM } from "../user-fcm/user-fcm.repository";
import { SendFirebaseNotification } from "../../utils/firebase-config";
import { NotificationMessage } from "../../utils/notification-message";

export const testingCronjob = async (req: Request, res: Response) => {
  req.query;
  const fcm = await getUserFCMByNIM("2255201237");
  for (const item of fcm) {
    await SendFirebaseNotification(
      NotificationMessage("ABAIKAN INI", "TESTING", item.fcmToken)
    );
  }
  console.log("running a task every 30 seconds");
  res.json({
    message: "success",
  });
};
