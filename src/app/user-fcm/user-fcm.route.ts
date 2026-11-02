import { Router } from "express";
import { CatchWrapper } from "../../utils/catch-wrapper";
import { VerifyAdmin } from "../../middleware/verify-admin";
import {
  deleteFCMUserController,
  getAllFCMUserController,
} from "./user-fcm.controller";

const route = Router();

route.get("/", VerifyAdmin, CatchWrapper(getAllFCMUserController));
route.delete("/:fcmUserId", VerifyAdmin, CatchWrapper(deleteFCMUserController));
export default route;
