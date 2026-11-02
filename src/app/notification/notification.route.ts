import { Router } from "express";
import { verifyToken } from "../../middleware/verify-token";
import { VerifyAdmin } from "../../middleware/verify-admin";
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
  VerifyAdmin,
  validateRequest(sendNotificationSchema),
  CatchWrapper(sendNotificationController)
);
route.post(
  "/:fcm",
  VerifyAdmin,
  validateRequest(sendNotificationSchema),
  CatchWrapper(sendSingleNotificationController)
);
route.post("/fcm/:fcmId", VerifyAdmin, CatchWrapper(sendNotificationByFcmIdController));
route.get("/", verifyToken, CatchWrapper(getNotificationController));
route.put(
  "/read/:notificationId",
  verifyToken,
  CatchWrapper(readNotificationController)
);

export default route;
