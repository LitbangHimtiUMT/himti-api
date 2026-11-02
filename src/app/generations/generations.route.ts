import { Router } from "express";
import { validateRequest } from "../../middleware/validate-request";
import { verifyToken } from "../../middleware/verify-token";
import { VerifyAdmin } from "../../middleware/verify-admin";
import { CatchWrapper } from "../../utils/catch-wrapper";
import {
  createAngkatanController,
  deleteAngkatanController,
  getAngkatanByIdController,
  getAngkatanController,
  updateAngkatanController,
} from "./generations.controller";
import { createAngkatanSchema } from "./generations.request";

const route = Router();

route.post(
  "/",
  VerifyAdmin,
  validateRequest(createAngkatanSchema),
  CatchWrapper(createAngkatanController)
);
route.get("/", verifyToken, CatchWrapper(getAngkatanController));
route.get("/:id", verifyToken, CatchWrapper(getAngkatanByIdController));
route.delete("/:id", VerifyAdmin, CatchWrapper(deleteAngkatanController));
route.put("/:id", VerifyAdmin, CatchWrapper(updateAngkatanController));

export default route;
