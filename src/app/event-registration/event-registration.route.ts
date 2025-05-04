import { Router } from "express";
import { verifyToken } from "../../middleware/verify-token";
import { CatchWrapper } from "../../utils/catch-wrapper";
import {
  createEventRegistrationController,
  getHistoryEventRegistrationController,
} from "./event-registration.controller";
import { upload } from "../../utils/upload-file-to-storage";

const route = Router();

route
  .use(verifyToken)
  .post(
    "/:eventId",
    CatchWrapper(upload.single("image")),
    CatchWrapper(createEventRegistrationController)
  )
  .get("/history", CatchWrapper(getHistoryEventRegistrationController));

export default route;
