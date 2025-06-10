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

route
  .use(verifyToken)
  .post(
    "/",
    validateRequest(createEventMeetingSchema),
    CatchWrapper(createEventMeetingController)
  );
route.put(
  "/:eventMeetingId",
  validateRequest(updateEventMeetingSchema),
  CatchWrapper(updateEventMeetingController)
);
route.get("/", CatchWrapper(getEventMeetingsController));
route.get("/meeting", CatchWrapper(getEventMeetingWithMeetingController));
route.get("/:eventMeetingId", CatchWrapper(getEventMeetingByIdController));
route.delete("/:eventMeetingId", CatchWrapper(deleteEventMeetingController));

export default route;
