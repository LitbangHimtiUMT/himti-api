import { Router } from "express";
import { verifyToken } from "../../middleware/verify-token";
import { CatchWrapper } from "../../utils/catch-wrapper";
import {
  getNotificationController,
  readNotificationController,
  sendNotificationByFcmIdController,
  sendNotificationController,
  sendSingleNotificationController,
} from "./notification.controller";
import { sendNotificationSchema } from "./notification.request";
import { validateRequest } from "../../middleware/validate-request";

const route = Router();

route.post(
  "/",
  validateRequest(sendNotificationSchema),
  CatchWrapper(sendNotificationController)
);
route.post(
  "/:fcm",
  validateRequest(sendNotificationSchema),
  CatchWrapper(sendSingleNotificationController)
);
route.post("/fcm/:fcmId", CatchWrapper(sendNotificationByFcmIdController));
route.get("/", verifyToken, CatchWrapper(getNotificationController));
route.put(
  "/read/:notificationId",
  verifyToken,
  CatchWrapper(readNotificationController)
);

export default route;
