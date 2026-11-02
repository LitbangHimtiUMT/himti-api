import { Router } from "express";
import { validateRequest } from "../../../middleware/validate-request";
import {
  optionalAuth,
  RolesEnum,
  verifyRole,
  verifyToken,
} from "../../../middleware/verify-token";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import { upload } from "../../../utils/upload-file-to-storage";
import {
  createClassController,
  deleteClassessController,
  getClassController,
  getClassUserController,
  getDetailClassByCodeController,
  getDetailClassController,
  joinInvitationClassController,
  publishClassController,
  updateClassController,
  userJoinClassController,
} from "./classes.controller";
import { joinInvitationClassSchema } from "./classes.request";
import {
  getMentorByClassController,
  inviteMentorController,
} from "../class-mentor/class-mentor.controller";
import { inviteMentorSchema } from "../class-mentor/class-mentor.request";

export const classRoute = Router();

// Public catalog: optionalAuth sets a VERIFIED userId when a valid
// token is present (so mentor/participant visibility still works),
// and leaves it empty for guests (published classes only, decided by
// the service). The old handlers trusted an unverified decode() and
// a header secret here; both are removed.
classRoute
  .get("/", optionalAuth, CatchWrapper(getClassController))
  .get("/user", verifyToken, CatchWrapper(getClassUserController))
  .get("/:classId", optionalAuth, CatchWrapper(getDetailClassController))
  .use(verifyToken)
  .post(
    "/invite",
    validateRequest(inviteMentorSchema),
    CatchWrapper(inviteMentorController)
  )
  .get("/mentor/:classId", CatchWrapper(getMentorByClassController))
  .post(
    "/",
    verifyRole([RolesEnum.MENTOR, RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN]),
    CatchWrapper(upload.single("thumbnail")),
    CatchWrapper(createClassController)
  )
  .put(
    "/:classId",
    verifyRole([RolesEnum.MENTOR, RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN]),
    CatchWrapper(upload.single("thumbnail")),
    CatchWrapper(updateClassController)
  )
  .post(
    "/join/invitation",
    validateRequest(joinInvitationClassSchema),
    CatchWrapper(joinInvitationClassController)
  )
  .get("/code/:code", CatchWrapper(getDetailClassByCodeController))
  .patch("/join/:classId", CatchWrapper(userJoinClassController))
  .patch(
    "/publish/:classId",
    verifyRole([RolesEnum.MENTOR, RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN]),
    CatchWrapper(publishClassController)
  )
  .delete("/:classId", CatchWrapper(deleteClassessController));
