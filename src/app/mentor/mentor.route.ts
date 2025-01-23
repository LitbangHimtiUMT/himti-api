import { Router } from "express";
import { CatchWrapper } from "../../utils/catch-wrapper";
import { createMentorController } from "./mentor.controller";
import { VerifyToken } from "../../middleware/verify-token";

export const mentorsRoute = Router();

mentorsRoute.post(
  "/:userId",
  VerifyToken,
  CatchWrapper(createMentorController)
);
