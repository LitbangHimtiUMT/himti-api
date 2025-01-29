import { Router } from "express";
import { verifyToken } from "../../../middleware/verify-token";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import { getMentorTransactionsByMentorController } from "./mentor-transactions.controller";

export const mentorTransactionRoute = Router();

mentorTransactionRoute.get(
  "/:mentorId",
  verifyToken(["ADMIN", "SUPER_ADMIN", "MENTOR"]),
  CatchWrapper(getMentorTransactionsByMentorController)
);
