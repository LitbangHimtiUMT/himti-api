import { Router } from "express";
import { RolesEnum, verifyRole, verifyToken } from "../../../middleware/verify-token";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import { createClassParticipantSchema } from "./class-participants.request";
import {
  createClassParticipantController,
  getClassParticipantsByClassIdController,
} from "./class-participants.controller";
import { validateRequest } from "../../../middleware/validate-request";

export const classParticipantRoute = Router();

classParticipantRoute
  .post(
    "/",
    verifyToken,
    validateRequest(createClassParticipantSchema),
    CatchWrapper(createClassParticipantController)
  )
  .get(
    "/:classid",
    verifyRole([RolesEnum.MENTOR, RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN]),
    CatchWrapper(getClassParticipantsByClassIdController)
  );
