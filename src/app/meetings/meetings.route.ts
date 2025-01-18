import { Router } from "express";
import { VerifyToken } from "../../middleware/verify-token";
import { validateRequest } from "../../middleware/validate-request";
import { CatchWrapper } from "../../utils/catch-wrapper";
import {
  createMeetingController,
  deleteMeetingController,
  getMeetingByEventMeetingIdController,
  getMeetingByIdController,
  getMeetingsController,
  updateMeetingController,
} from "./meetings.controller";
import { createMeetingSchema, updateMeetingSchema } from "./meetings.request";
import { VerifySuperAdmin } from "../../middleware/verify-super-admin";

const route = Router();

route.get("/", VerifyToken, CatchWrapper(getMeetingsController));
route.put(
  "/:meetingId",
  VerifySuperAdmin,
  validateRequest(updateMeetingSchema),
  CatchWrapper(updateMeetingController)
);
route.post(
  "/",
  validateRequest(createMeetingSchema),
  CatchWrapper(createMeetingController)
);
route.get("/:meetingId", VerifyToken, CatchWrapper(getMeetingByIdController));
route.get(
  "/event-meeting/:eventMeetingId",
  VerifyToken,
  CatchWrapper(getMeetingByEventMeetingIdController)
);
route.delete(
  "/:meetingId",
  VerifySuperAdmin,
  CatchWrapper(deleteMeetingController)
);

export default route;
