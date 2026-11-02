import { Router } from "express";
import { VerifyAdmin } from "../../middleware/verify-admin";
import { CatchWrapper } from "../../utils/catch-wrapper";
import { upload as UploadFile } from "../../utils/upload-file-to-storage";
import {
  createSubAcaraController,
  deleteSubAcaraController,
  getSubAcaraController,
  getSubAcaraDetailController,
  updateSubAcaraController,
} from "./sub-acara.controller";

const route = Router();

// Reads mirror Event reads (public catalog). Writes are admin-only,
// like Event writes.
route.get("/", CatchWrapper(getSubAcaraController));
route.get("/:id", CatchWrapper(getSubAcaraDetailController));
route.post(
  "/",
  VerifyAdmin,
  CatchWrapper(UploadFile.single("image")),
  CatchWrapper(createSubAcaraController)
);
route.put(
  "/:id",
  VerifyAdmin,
  CatchWrapper(UploadFile.single("image")),
  CatchWrapper(updateSubAcaraController)
);
route.delete("/:id", VerifyAdmin, CatchWrapper(deleteSubAcaraController));

export default route;
