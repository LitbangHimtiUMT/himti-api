import { Router } from "express";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import {
  createMentorController,
  getMentorsController,
} from "./mentor.controller";
import { verifyToken } from "../../../middleware/verify-token";

export const mentorsRoute = Router();

mentorsRoute
  .post("/:userId", verifyToken(), CatchWrapper(createMentorController))
  .get("/", verifyToken(), CatchWrapper(getMentorsController));
