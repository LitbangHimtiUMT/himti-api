import { Router } from "express";
import { verifyToken } from "../../middleware/verify-token";
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

route
  .use(verifyToken)
  .get("/", CatchWrapper(getMeetingsController))
  .put(
    "/:meetingId",
    VerifySuperAdmin,
    validateRequest(updateMeetingSchema),
    CatchWrapper(updateMeetingController)
  )
  .post(
    "/",
    validateRequest(createMeetingSchema),
    CatchWrapper(createMeetingController)
  )
  .get("/:meetingId", CatchWrapper(getMeetingByIdController))
  .get(
    "/event-meeting/:eventMeetingId",
    CatchWrapper(getMeetingByEventMeetingIdController)
  )
  .delete(
    "/:meetingId",
    VerifySuperAdmin,
    CatchWrapper(deleteMeetingController)
  );

export default route;
