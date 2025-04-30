import { Router } from "express";
import { validateRequest } from "../../middleware/validate-request";
import { VerifyAdmin } from "../../middleware/verify-admin";
import {
  RolesEnum,
  verifyRole,
  verifyToken,
} from "../../middleware/verify-token";
import { CatchWrapper } from "../../utils/catch-wrapper";
import {
  createUserController,
  deleteUserController,
  getUserController,
  getUsersController,
  getUserWithoutMentorController,
  updateUserController,
} from "./user.controller";
import { createUserSchema, updateUserSchema } from "./user.request";

const route = Router();

route
  .use(verifyToken)
  .get("/", VerifyAdmin, CatchWrapper(getUsersController))
  .get(
    "/without-mentor",
    verifyRole([RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN]),
    CatchWrapper(getUserWithoutMentorController)
  )
  .get("/:userId", VerifyAdmin, CatchWrapper(getUserController))
  .get(
    "/admin",
    verifyRole([RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN]),
    validateRequest(createUserSchema),
    CatchWrapper(createUserController)
  )
  .put(
    "/admin/:userId",
    verifyRole([RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN]),
    validateRequest(updateUserSchema),
    CatchWrapper(updateUserController)
  )

  .delete("/", verifyToken, CatchWrapper(deleteUserController));

export default route;
