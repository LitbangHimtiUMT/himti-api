import { Router } from "express";
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
  getClassController,
  getClassUserController,
  getDetailClassByCodeController,
  getDetailClassController,
  joinInvitationClassController,
  publishClassController,
  userJoinClassController,
} from "./classes.controller";
import { validateRequest } from "../../../middleware/validate-request";
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
  .get(
    "/user",
    verifyRole([RolesEnum.USER, RolesEnum.ANGGOTA, RolesEnum.MENTOR]),
    CatchWrapper(getClassUserController)
  )
  .post(
    "/join/invitation",
    verifyRole([RolesEnum.USER, RolesEnum.ANGGOTA]),
    validateRequest(joinInvitationClassSchema),
    CatchWrapper(joinInvitationClassController)
  )
  .get("/code/:code", CatchWrapper(getDetailClassByCodeController))
  .patch(
    "/join/:classId",
    verifyRole([RolesEnum.USER, RolesEnum.ANGGOTA, RolesEnum.MENTOR]),
    CatchWrapper(userJoinClassController)
  )
  .patch(
    "/publish/:classId",
    verifyRole([RolesEnum.MENTOR]),
    CatchWrapper(publishClassController)
  )
  .get("/:classId", CatchWrapper(getDetailClassController));
