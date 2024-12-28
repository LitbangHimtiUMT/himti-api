import { Router } from "express";
import { VerifyAdmin } from "../../middleware/verifyAdmin";
import { VerifyToken } from "../../middleware/verifyToken";
import { CatchWrapper } from "../../utils/catch-wrapper";
import {
  createAttendanceController,
  getAttendanceByIdController,
  getAttendanceController,
  getAttendancesController,
} from "./attendancesController";
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
