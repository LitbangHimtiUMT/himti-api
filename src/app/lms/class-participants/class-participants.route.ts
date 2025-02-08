import { Router } from "express";
import { verifyToken } from "../../../middleware/verify-token";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import { createClassParticipantSchema } from "./class-participants.request";
import { createClassParticipantController } from "./class-participants.controller";
import { validateRequest } from "../../../middleware/validate-request";

export const classParticipantRoute = Router();

classParticipantRoute.post(
  "/",
  verifyToken(),
  validateRequest(createClassParticipantSchema),
  CatchWrapper(createClassParticipantController),
);
