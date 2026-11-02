import { Router } from "express";
import { CatchWrapper } from "../../utils/catch-wrapper";
import { VerifyAdmin } from "../../middleware/verify-admin";
import { upload } from "../../utils/upload-file-to-storage";
import {
  createProdiStructuralController,
  deleteProdiStructuralController,
  getProdiStructuralController,
  updateProdiStructuralController,
} from "./prodi-structural.controller";

const route = Router();

route.get("/", CatchWrapper(getProdiStructuralController));
route.post("/", VerifyAdmin, upload.single("image"), CatchWrapper(createProdiStructuralController));
route.put("/:id", VerifyAdmin, upload.single("image"), CatchWrapper(updateProdiStructuralController));
route.delete("/:id", VerifyAdmin, CatchWrapper(deleteProdiStructuralController));

export default route;
