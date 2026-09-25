import { Router } from "express";
import * as RegistrationTypeController from "./registration-type.controller";
import { validateRequest } from "../../middleware/validate-request";
import { CatchWrapper } from "../../utils/catch-wrapper";
import { upload } from "../../utils/upload-file-to-storage";
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
    upload.single("image"),
    validateRequest(createRegistrationTypeSchema),
    CatchWrapper(RegistrationTypeController.createRegistrationType)
  )
  .get("/", CatchWrapper(RegistrationTypeController.getRegistrationTypes))
  .get("/:id", CatchWrapper(RegistrationTypeController.getRegistrationTypeById))
  .put(
    "/:id",
    upload.single("image"),
    validateRequest(updateRegistrationTypeSchema),
    CatchWrapper(RegistrationTypeController.updateRegistrationType)
  )
  .delete(
    "/:id",
    CatchWrapper(RegistrationTypeController.deleteRegistrationType)
  );

export default router;
