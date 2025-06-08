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
  deleteClassessController,
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
    verifyToken,
    // verifyRole([RolesEnum.USER, RolesEnum.ANGGOTA, RolesEnum.MENTOR]),
    CatchWrapper(getClassUserController)
  )
  .post(
    "/join/invitation",
    verifyToken,
    // verifyRole([RolesEnum.USER, RolesEnum.ANGGOTA, RolesEnum.MENTOR]),
    validateRequest(joinInvitationClassSchema),
    CatchWrapper(joinInvitationClassController)
  )
  .get("/code/:code", CatchWrapper(getDetailClassByCodeController))
  .patch(
    "/join/:classId",
    verifyToken,
    // verifyRole([RolesEnum.USER, RolesEnum.ANGGOTA, RolesEnum.MENTOR]),
    CatchWrapper(userJoinClassController)
  )
  .patch(
    "/publish/:classId",
    verifyToken,
    // verifyRole([RolesEnum.MENTOR]),
    CatchWrapper(publishClassController)
  )
  .delete(
    "/:classId",
    verifyToken,
    CatchWrapper(deleteClassessController)
  )
  .get("/:classId", CatchWrapper(getDetailClassController));
