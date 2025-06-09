import { Router } from "express";
import { validateRequest } from "../../../middleware/validate-request";
import {
  decodeToken,
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
  userJoinClassController,
} from "./classes.controller";
import { joinInvitationClassSchema } from "./classes.request";

export const classRoute = Router();

classRoute
  .use(decodeToken)
  .get("/", CatchWrapper(getClassController))
  .use(verifyToken)
  .post(
    "/",
    verifyRole([RolesEnum.MENTOR, RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN]),
    CatchWrapper(upload.single("thumbnail")),
    CatchWrapper(createClassController)
  )
  .get("/user", CatchWrapper(getClassUserController))
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
  .delete("/:classId", CatchWrapper(deleteClassessController))
  .get("/:classId", CatchWrapper(getDetailClassController));
