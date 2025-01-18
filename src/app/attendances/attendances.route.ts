import { Router } from "express";
import { VerifyAdmin } from "../../middleware/verify-admin";
import { VerifyToken } from "../../middleware/verify-token";
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
  VerifyToken,
  CatchWrapper(upload.single("image")),
  CatchWrapper(createAttendanceController)
);
route.get("/", VerifyToken, CatchWrapper(getAttendanceController));
route.get(
  "/meeting/:meetingId",
  VerifyAdmin,
  CatchWrapper(getAttendancesController)
);
route.get("/:id", VerifyToken, CatchWrapper(getAttendanceByIdController));

export default route;
