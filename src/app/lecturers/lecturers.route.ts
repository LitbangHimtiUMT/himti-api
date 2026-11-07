import { Router } from "express";
import { validateRequest } from "../../middleware/validate-request";
import { VerifyAdmin } from "../../middleware/verify-admin";
import { CatchWrapper } from "../../utils/catch-wrapper";
import {
  createLecturerController,
  deleteLecturerController,
  getLecturerByIdController,
  getLecturerController,
  updateLecturerController,
} from "./lecturers.controller";
import { createDosenSchema } from "./lecturers.request";

const route = Router();

// Public endpoint (no auth) — dipakai halaman publik website.
route.get("/public", CatchWrapper(getLecturerController));

route.post(
  "/",
  VerifyAdmin,
  validateRequest(createDosenSchema),
  CatchWrapper(createLecturerController)
);
route.get("/", CatchWrapper(getLecturerController));
// Dipakai halaman Edit Dosen di CMS (useDosenById). Sebelumnya tidak
// ada, jadi GET /dosen/:id jatuh ke catch-all 404 dan form edit
// tampil kosong. Ditaruh setelah GET /public supaya route itu tetap
// menang (Express mencocokkan berurutan).
route.get("/:id", CatchWrapper(getLecturerByIdController));
route.delete("/:id", VerifyAdmin, CatchWrapper(deleteLecturerController));
route.put("/:id", VerifyAdmin, CatchWrapper(updateLecturerController));

export default route;
