import { Router } from "express";
import { validateRequest } from "../../middleware/validate-request";
import { verifyToken } from "../../middleware/verify-token";
import { CatchWrapper } from "../../utils/catch-wrapper";
import {
  createMemberController,
  deleteMemberController,
  getMemberByIdController,
  getMemberController,
  updateMemberController,
} from "./members.controller";
import { createMemberSchema } from "./members.request";

const route = Router();

route.post(
  "/",
  verifyToken(),
  validateRequest(createMemberSchema),
  CatchWrapper(createMemberController)
);
route.get("/", verifyToken(), CatchWrapper(getMemberController));
route.get("/:id", verifyToken(), CatchWrapper(getMemberByIdController));
route.delete("/:id", CatchWrapper(deleteMemberController));
route.put("/:id", CatchWrapper(updateMemberController));

export default route;
