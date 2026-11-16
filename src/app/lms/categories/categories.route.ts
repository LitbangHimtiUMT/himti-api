import { Router } from "express";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import {
  createCategoryController,
  deleteCategoryController,
  getCategoriesController,
  getCategoryByIdController,
  updateCategoryController,
} from "./categories.controller";
import { validateRequest } from "../../../middleware/validate-request";
import {
  createCategorySchema,
  updateCategorySchema,
} from "./categories.request";
import {
  RolesEnum,
  verifyRole,
  verifyToken,
} from "../../../middleware/verify-token";

export const categoriesRoute = Router();

// The category list is public: the guest-visible class catalog needs it
// for its filter tabs, and it carries no per-user data (id, name, count).
// Writes and the single-category lookup stay behind auth below.
categoriesRoute.get("/", CatchWrapper(getCategoriesController));

categoriesRoute
  .use(verifyToken)
  .post(
    "/",
    verifyRole([RolesEnum.MENTOR, RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN]),
    validateRequest(createCategorySchema),
    CatchWrapper(createCategoryController)
  )
  .get("/:categoryId", CatchWrapper(getCategoryByIdController))
  .put(
    "/:categoryId",
    verifyRole([RolesEnum.MENTOR, RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN]),
    validateRequest(updateCategorySchema),
    CatchWrapper(updateCategoryController)
  )
  .delete(
    "/:categoryId",
    verifyRole([RolesEnum.MENTOR, RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN]),
    CatchWrapper(deleteCategoryController)
  );
