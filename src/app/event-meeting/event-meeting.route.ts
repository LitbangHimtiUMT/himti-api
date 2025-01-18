import { Router } from "express";
import { validateRequest } from "../../middleware/validate-request";
import { VerifyToken } from "../../middleware/verify-token";
import { CatchWrapper } from "../../utils/catch-wrapper";
import {
  createEventMeetingController,
  deleteEventMeetingController,
  getEventMeetingByIdController,
  getEventMeetingWithMeetingController,
  getEventMeetingsController,
  updateEventMeetingController,
} from "./event-meeting.controller";
import {
  createEventMeetingSchema,
  updateEventMeetingSchema,
} from "./event-meeting.request";

const route = Router();

route.post(
  "/",
  VerifyToken,
  validateRequest(createEventMeetingSchema),
  CatchWrapper(createEventMeetingController)
);
route.put(
  "/:eventMeetingId",
  VerifyToken,
  validateRequest(updateEventMeetingSchema),
  CatchWrapper(updateEventMeetingController)
);
route.get("/", VerifyToken, CatchWrapper(getEventMeetingsController));
route.get(
  "/meeting",
  VerifyToken,
  CatchWrapper(getEventMeetingWithMeetingController)
);
route.get(
  "/:eventMeetingId",
  VerifyToken,
  CatchWrapper(getEventMeetingByIdController)
);
route.delete(
  "/:eventMeetingId",
  VerifyToken,
  CatchWrapper(deleteEventMeetingController)
);

export default route;
