import { Router } from "express";
import * as RegistrationTypeController from "./registration-type.controller";
import { validateRequest } from "../../middleware/validate-request";
import { CatchWrapper } from "../../utils/catch-wrapper";
import {
  createRegistrationTypeSchema,
  updateRegistrationTypeSchema,
} from "./registration-type.request";

const router = Router();

router
  .get(
    "/options/event-types",
    CatchWrapper(RegistrationTypeController.getRegistrationTypeOptions)
  )
  .post(
    "/",
    validateRequest(createRegistrationTypeSchema),
    CatchWrapper(RegistrationTypeController.createRegistrationType)
  )
  .get("/", CatchWrapper(RegistrationTypeController.getRegistrationTypes))
  .get("/:id", CatchWrapper(RegistrationTypeController.getRegistrationTypeById))
  .put(
    "/:id",
    validateRequest(updateRegistrationTypeSchema),
    CatchWrapper(RegistrationTypeController.updateRegistrationType)
  )
  .delete(
    "/:id",
    CatchWrapper(RegistrationTypeController.deleteRegistrationType)
  );

export default router;
