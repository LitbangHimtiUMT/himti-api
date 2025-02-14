import { Router } from "express";
import { verifyToken } from "../../../middleware/verify-token";
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
    verifyToken(),
    validateRequest(createClassParticipantSchema),
    CatchWrapper(createClassParticipantController)
  )
  .get(
    "/:classid",
    verifyToken(["MENTOR", "SUPER_ADMIN", "ADMIN"]),
    CatchWrapper(getClassParticipantsByClassIdController)
  );
