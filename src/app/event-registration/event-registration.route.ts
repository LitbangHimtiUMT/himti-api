import { Router } from "express";
import * as EventRegistrationController from "./event-registration.controller";
import { validateRequest } from "../../middleware/validate-request";
import { CatchWrapper } from "../../utils/catch-wrapper";
import { upload as UploadFile } from "../../utils/upload-file-to-storage";
import {
  createEventRegistrationSchema,
  updateEventRegistrationSchema,
} from "./event-registration.request";

const router = Router();

router
  .post(
    "/",
    // accept optional image file upload
    CatchWrapper(UploadFile.single("image")),
    validateRequest(createEventRegistrationSchema),
    CatchWrapper(EventRegistrationController.createEventRegistration)
  )
  .get("/", CatchWrapper(EventRegistrationController.getEventRegistrations))
  .get(
    "/:id",
    CatchWrapper(EventRegistrationController.getEventRegistrationById)
  )
  .put(
    "/:id",
    validateRequest(updateEventRegistrationSchema),
    CatchWrapper(EventRegistrationController.updateEventRegistration)
  )
  .delete(
    "/:id",
    CatchWrapper(EventRegistrationController.deleteEventRegistration)
  );

export default router;
