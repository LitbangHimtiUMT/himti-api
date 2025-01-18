import { Router } from "express";
import { validateRequest } from "../../middleware/validate-request";
import { VerifyToken } from "../../middleware/verify-token";
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
  VerifyToken,
  validateRequest(createMemberSchema),
  CatchWrapper(createMemberController)
);
route.get("/", VerifyToken, CatchWrapper(getMemberController));
route.get("/:id", VerifyToken, CatchWrapper(getMemberByIdController));
route.delete("/:id", CatchWrapper(deleteMemberController));
route.put("/:id", CatchWrapper(updateMemberController));

export default route;
