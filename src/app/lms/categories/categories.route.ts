import { Router } from "express";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import { createCategoryController, getCategoriesController } from "./categories.controller";
import { validateRequest } from "../../../middleware/validate-request";
import { createCategorySchema } from "./categories.request";
import { verifyToken } from "../../../middleware/verify-token";

export const categoriesRoute = Router();

categoriesRoute
.post(
  "/",
  verifyToken(["MENTOR", "SUPER_ADMIN", "ADMIN"]),
  validateRequest(createCategorySchema),
  CatchWrapper(createCategoryController)
)
.get('/', CatchWrapper(getCategoriesController))
;
