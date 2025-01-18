import { Router } from "express";
import { validateRequest } from "../../middleware/validate-request";
import { VerifyAdmin } from "../../middleware/verify-admin";
import { VerifySuperAdmin } from "../../middleware/verify-super-admin";
import { CatchWrapper } from "../../utils/catch-wrapper";
import {
  createUserController,
  deleteUserController,
  getUserController,
  getUsersController,
  updateUserController,
} from "./user.controller";
import { createUserSchema, updateUserSchema } from "./user.request";
import { VerifyToken } from "../../middleware/verify-token";

const route = Router();

route.get("/", VerifyAdmin, CatchWrapper(getUsersController));
route.get("/:userId", VerifyAdmin, CatchWrapper(getUserController));
route.get(
  "/admin",
  VerifySuperAdmin,
  validateRequest(createUserSchema),
  CatchWrapper(createUserController)
);
route.put(
  "/admin/:userId",
  VerifySuperAdmin,
  validateRequest(updateUserSchema),
  CatchWrapper(updateUserController)
);
route.delete("/", VerifyToken, CatchWrapper(deleteUserController));

export default route;
