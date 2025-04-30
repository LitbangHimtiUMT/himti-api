import { Router } from "express";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import {
  createMentorController,
  deleteMentorController,
  getMentorByIdController,
  getMentorsController,
} from "./mentor.controller";
import {
  RolesEnum,
  verifyRole,
  verifyToken,
} from "../../../middleware/verify-token";
import { verifyKey } from "../../../middleware/verify-key";

export const mentorsRoute = Router();

mentorsRoute
  .use(verifyToken)
  .post(
    "/:userId",
    verifyRole([RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN]),
    CatchWrapper(createMentorController)
  )
  .get("/", verifyKey, CatchWrapper(getMentorsController))
  .get(
    "/:mentorId",
    verifyRole([RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN]),
    CatchWrapper(getMentorByIdController)
  )
  .delete(
    "/:mentorId",
    verifyRole([RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN]),
    CatchWrapper(deleteMentorController)
  );
