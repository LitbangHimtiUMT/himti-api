import { Router } from "express";
import rateLimit from "express-rate-limit";
import { validateRequest } from "../../middleware/validate-request";
import { VerifyAdmin } from "../../middleware/verify-admin";
import { CatchWrapper } from "../../utils/catch-wrapper";
import { upload as UploadFile } from "../../utils/upload-file-to-storage";
import * as EventRegistrationController from "./event-registration.controller";
import { updateEventRegistrationSchema } from "./event-registration.request";

const router = Router();

// Public registration stays public (open event registration used by
// the main website), but it is no longer unlimited: rate-limited and
// validated. All other routes in this file are admin-only; the old
// file had no auth middleware at all, including delete and import.
const publicRegistrationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: {
    status: 429,
    message:
      "Terlalu banyak pendaftaran dari IP ini. Silakan coba lagi nanti.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router
  .post(
    "/",
    publicRegistrationLimiter,
    // accept optional image file upload
    CatchWrapper(UploadFile.single("image")),
    CatchWrapper(EventRegistrationController.createEventRegistration)
  )
  .get("/", VerifyAdmin, CatchWrapper(EventRegistrationController.getEventRegistrations))
  .get(
    "/registration-type/:registrationTypeId",
    VerifyAdmin,
    CatchWrapper(
      EventRegistrationController.getEventRegistrationsByRegistrationType
    )
  )
  .get(
    "/:id",
    VerifyAdmin,
    CatchWrapper(EventRegistrationController.getEventRegistrationById)
  )
  .put(
    "/:id",
    VerifyAdmin,
    validateRequest(updateEventRegistrationSchema),
    CatchWrapper(EventRegistrationController.updateEventRegistration)
  )
  .delete(
    "/:id",
    VerifyAdmin,
    CatchWrapper(EventRegistrationController.deleteEventRegistration)
  )
  .get(
    "/registration-type/:registrationTypeId/export-absensi",
    VerifyAdmin,
    CatchWrapper(
      EventRegistrationController.exportAbsensiByRegistrationType
    )
  )
  .post(
    "/registration/:registrationTypeId/member/import",
    VerifyAdmin,
    CatchWrapper(EventRegistrationController.importMembersFromRegistration)
  );

export default router;
