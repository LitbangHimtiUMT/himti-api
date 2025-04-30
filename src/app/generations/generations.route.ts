import { Router } from "express";
import { validateRequest } from "../../middleware/validate-request";
import { verifyToken } from "../../middleware/verify-token";
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
  verifyToken,
  validateRequest(createAngkatanSchema),
  CatchWrapper(createAngkatanController)
);
route.get("/", verifyToken, CatchWrapper(getAngkatanController));
route.get("/:id", verifyToken, CatchWrapper(getAngkatanByIdController));
route.delete("/:id", verifyToken, CatchWrapper(deleteAngkatanController));
route.put("/:id", verifyToken, CatchWrapper(updateAngkatanController));

export default route;
