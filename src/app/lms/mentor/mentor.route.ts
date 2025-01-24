import { Router } from "express";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import {
  createMentorController,
  getMentorsController,
} from "./mentor.controller";
import { VerifyToken } from "../../../middleware/verify-token";

export const mentorsRoute = Router();

mentorsRoute
  .post("/:userId", VerifyToken, CatchWrapper(createMentorController))
  .get("/", VerifyToken, CatchWrapper(getMentorsController));
