import { Router } from "express";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import { createCategoryController } from "./categories.controller";
import { validateRequest } from "../../../middleware/validate-request";
import { createCategorySchema } from "./categories.request";

export const categoriesRoute = Router();

categoriesRoute.post(
  "/",
  validateRequest(createCategorySchema),
  CatchWrapper(createCategoryController)
);
