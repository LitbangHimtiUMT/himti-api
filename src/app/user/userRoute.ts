import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { VerifyAdmin } from "../../middleware/verifyAdmin";
import { VerifySuperAdmin } from "../../middleware/verifySuperAdmin";
import { CatchWrapper } from "../../utils/catch-wrapper";
import {
  createUserController,
  deleteUserController,
  getUserController,
  getUsersController,
  updateUserController,
} from "./userController";
import { createUserSchema, updateUserSchema } from "./userRequest";
import { VerifyToken } from "../../middleware/verifyToken";

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
