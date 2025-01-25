import { Router } from "express";
import { validateRequest } from "../../middleware/validate-request";
import { verifyToken } from "../../middleware/verify-token";
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
  verifyToken(),
  validateRequest(createEventMeetingSchema),
  CatchWrapper(createEventMeetingController)
);
route.put(
  "/:eventMeetingId",
  verifyToken(),
  validateRequest(updateEventMeetingSchema),
  CatchWrapper(updateEventMeetingController)
);
route.get("/", verifyToken(), CatchWrapper(getEventMeetingsController));
route.get(
  "/meeting",
  verifyToken(),
  CatchWrapper(getEventMeetingWithMeetingController)
);
route.get(
  "/:eventMeetingId",
  verifyToken(),
  CatchWrapper(getEventMeetingByIdController)
);
route.delete(
  "/:eventMeetingId",
  verifyToken(),
  CatchWrapper(deleteEventMeetingController)
);

export default route;
