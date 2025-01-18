import { Router } from "express";
import { validateRequest } from "../../middleware/validate-request";
import { VerifyToken } from "../../middleware/verify-token";
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
  VerifyToken,
  validateRequest(createAngkatanSchema),
  CatchWrapper(createAngkatanController)
);
route.get("/", VerifyToken, CatchWrapper(getAngkatanController));
route.get("/:id", VerifyToken, CatchWrapper(getAngkatanByIdController));
route.delete("/:id", VerifyToken, CatchWrapper(deleteAngkatanController));
route.put("/:id", VerifyToken, CatchWrapper(updateAngkatanController));

export default route;
