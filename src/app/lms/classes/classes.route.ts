import { Router } from "express";
import { verifyToken } from "../../../middleware/verify-token";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import { upload } from "../../../utils/upload-file-to-storage";
import {
  createClassController,
  getClassController,
  getClassUserController,
  getDetailClassByCodeController,
  getDetailClassController,
  joinInvitationClassController,
  userJoinClassController,
} from "./classes.controller";
import { validateRequest } from "../../../middleware/validate-request";
import { joinInvitationClassSchema } from "./classes.request";

export const classRoute = Router();

classRoute
  .post(
    "/",
    verifyToken(["MENTOR", "SUPER_ADMIN", "ADMIN"]),
    CatchWrapper(upload.single("thumbnail")),
    CatchWrapper(createClassController)
  )
  .get("/", verifyToken(), CatchWrapper(getClassController))
  .get(
    "/user",
    verifyToken(["USER", "ANGGOTA", "MENTOR"]),
    CatchWrapper(getClassUserController)
  )
  .post(
    "/join/invitation",
    verifyToken(["USER", "ANGGOTA"]),
    validateRequest(joinInvitationClassSchema),
    CatchWrapper(joinInvitationClassController)
  )
  .get(
    "/code/:code",
    verifyToken(),
    CatchWrapper(getDetailClassByCodeController)
  )
  .patch(
    "/join/:classId",
    verifyToken(["USER", "ANGGOTA", "MENTOR"]),
    CatchWrapper(userJoinClassController)
  )
  .get("/:classId", CatchWrapper(getDetailClassController));
