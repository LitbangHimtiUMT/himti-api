import { Router } from "express";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import {
  createMentorController,
  deleteMentorController,
  getMentorByIdController,
  getMentorsController,
} from "./mentor.controller";
import { verifyToken } from "../../../middleware/verify-token";
import { verifyKey } from "../../../middleware/verify-key";

export const mentorsRoute = Router();

mentorsRoute
  .post(
    "/:userId",
    verifyToken(["ADMIN", "SUPER_ADMIN"]),
    CatchWrapper(createMentorController)
  )
  .get("/", verifyKey, CatchWrapper(getMentorsController))
  .get(
    "/:mentorId",
    verifyToken(["SUPER_ADMIN", "ADMIN"]),
    CatchWrapper(getMentorByIdController)
  )
  .delete(
    "/:mentorId",
    verifyToken(["ADMIN", "SUPER_ADMIN"]),
    CatchWrapper(deleteMentorController)
  );
