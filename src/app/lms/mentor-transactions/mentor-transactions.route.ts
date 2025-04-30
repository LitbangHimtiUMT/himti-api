import { Router } from "express";
import { RolesEnum, verifyRole } from "../../../middleware/verify-token";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import { getMentorTransactionsByMentorController } from "./mentor-transactions.controller";

export const mentorTransactionRoute = Router();

mentorTransactionRoute.get(
  "/:mentorId",
  verifyRole([RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN, RolesEnum.MENTOR]),
  CatchWrapper(getMentorTransactionsByMentorController)
);
