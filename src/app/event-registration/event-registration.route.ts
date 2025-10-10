import { Router } from "express";
import * as EventRegistrationController from "./event-registration.controller";
import { validateRequest } from "../../middleware/validate-request";
import { CatchWrapper } from "../../utils/catch-wrapper";
import {
  createEventRegistrationSchema,
  updateEventRegistrationSchema,
} from "./event-registration.request";

const router = Router();

router
  .post(
    "/",
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