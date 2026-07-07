import { Router } from "express";
import { environment } from "../../../libs";
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

classRoute
  .get("/", (req, res, next) => {
    // If authorization header is present, always decode token first to enforce user visibility (e.g. mentor class isolation)
    if (req.headers.authorization) {
      return decodeToken(req, res, () => CatchWrapper(getClassController)(req, res, next));
    }
    
    // Otherwise, check for API Key for public/guest access
    const apiKey = req.headers[environment.HEADER_KEY.toLowerCase()];
    const apiKeyStr = (Array.isArray(apiKey) ? apiKey[0] : apiKey) || "";
    if (apiKeyStr && atob(apiKeyStr) === environment.SECRET_KEY) {
      return CatchWrapper(getClassController)(req, res, next);
    }
    // Fallback
    return decodeToken(req, res, () => CatchWrapper(getClassController)(req, res, next));
  })
  .get("/user", decodeToken, verifyToken, CatchWrapper(getClassUserController))
  .get("/:classId", (req, res, next) => {
    const apiKey = req.headers[environment.HEADER_KEY.toLowerCase()];
    const apiKeyStr = (Array.isArray(apiKey) ? apiKey[0] : apiKey) || "";
    if (apiKeyStr && atob(apiKeyStr) === environment.SECRET_KEY) {
      return CatchWrapper(getDetailClassController)(req, res, next);
    }
    return decodeToken(req, res, () => CatchWrapper(getDetailClassController)(req, res, next));
  })
  .use(decodeToken)
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
