import { Router } from "express";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import {
  createCategoryController,
  getCategoriesController,
} from "./categories.controller";
import { validateRequest } from "../../../middleware/validate-request";
import { createCategorySchema } from "./categories.request";
import {
  RolesEnum,
  verifyRole,
  verifyToken,
} from "../../../middleware/verify-token";

export const categoriesRoute = Router();

categoriesRoute
  .use(verifyToken)
  .post(
    "/",
    verifyRole([RolesEnum.MENTOR, RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN]),
    validateRequest(createCategorySchema),
    CatchWrapper(createCategoryController)
  )
  .get("/", CatchWrapper(getCategoriesController));
