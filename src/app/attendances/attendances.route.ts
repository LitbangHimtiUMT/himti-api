import { Router } from "express";
import { VerifyAdmin } from "../../middleware/verify-admin";
import { verifyToken } from "../../middleware/verify-token";
import { CatchWrapper } from "../../utils/catch-wrapper";
import {
  createAttendanceController,
  getAttendanceByIdController,
  getAttendanceController,
  getAttendancesController,
} from "./attendances.controller";
import { upload } from "../../utils/upload-file-to-storage";

const route = Router();

route.post(
  "/",
  verifyToken,
  CatchWrapper(upload.single("image")),
  CatchWrapper(createAttendanceController)
);
route.get("/", verifyToken, CatchWrapper(getAttendanceController));
route.get(
  "/meeting/:meetingId",
  VerifyAdmin,
  CatchWrapper(getAttendancesController)
);
route.get("/:id", verifyToken, CatchWrapper(getAttendanceByIdController));

export default route;
