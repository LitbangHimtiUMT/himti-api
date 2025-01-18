import { Router } from "express";
import { validateRequest } from "../../middleware/validate-request";
import { VerifyToken } from "../../middleware/verify-token";
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
  VerifyToken,
  validateRequest(createDosenSchema),
  CatchWrapper(createLecturerController)
);
route.get("/", VerifyToken, CatchWrapper(getLecturerController));
route.delete("/:id", VerifyToken, CatchWrapper(deleteLecturerController));
route.put("/:id", VerifyToken, CatchWrapper(updateLecturerController));

export default route;
