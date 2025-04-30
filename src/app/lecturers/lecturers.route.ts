import { Router } from "express";
import { validateRequest } from "../../middleware/validate-request";
import { verifyToken } from "../../middleware/verify-token";
import { CatchWrapper } from "../../utils/catch-wrapper";
import {
  createLecturerController,
  deleteLecturerController,
  getLecturerController,
  updateLecturerController,
} from "./lecturers.controller";
import { createDosenSchema } from "./lecturers.request";

const route = Router();

route.post(
  "/",
  verifyToken,
  validateRequest(createDosenSchema),
  CatchWrapper(createLecturerController)
);
route.get("/", verifyToken, CatchWrapper(getLecturerController));
route.delete("/:id", verifyToken, CatchWrapper(deleteLecturerController));
route.put("/:id", verifyToken, CatchWrapper(updateLecturerController));

export default route;
