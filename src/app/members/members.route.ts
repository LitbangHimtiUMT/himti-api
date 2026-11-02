import { Router } from "express";
import { validateRequest } from "../../middleware/validate-request";
import { verifyToken } from "../../middleware/verify-token";
import { VerifyAdmin } from "../../middleware/verify-admin";
import { CatchWrapper } from "../../utils/catch-wrapper";
import {
  createMemberController,
  deleteMemberController,
  getMemberByIdController,
  getMemberController,
  updateMemberController,
  exportMembersController,
  getGenerationsListController,
} from "./members.controller";
import { createMemberSchema } from "./members.request";

const route = Router();

route.post(
  "/",
  verifyToken,
  validateRequest(createMemberSchema),
  CatchWrapper(createMemberController)
);
// Public endpoints (no auth) — digunakan website publik.
// Ditempatkan sebelum "/:id" agar tidak ter-match sebagai id.
route.get("/generations", CatchWrapper(getGenerationsListController));
route.get("/public", CatchWrapper(getMemberController));

route.get("/", CatchWrapper(getMemberController));
route.get("/export/excel", VerifyAdmin, CatchWrapper(exportMembersController));
route.get("/:id", VerifyAdmin, CatchWrapper(getMemberByIdController));
route.delete("/:id", VerifyAdmin, CatchWrapper(deleteMemberController));
route.put("/:id", VerifyAdmin, CatchWrapper(updateMemberController));

export default route;
