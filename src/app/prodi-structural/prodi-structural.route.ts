import { Router } from "express";
import { CatchWrapper } from "../../utils/catch-wrapper";
import { VerifyAdmin } from "../../middleware/verify-admin";
import { upload } from "../../utils/upload-file-to-storage";
import {
  createProdiStructuralController,
  deleteProdiStructuralController,
  getProdiStructuralByIdController,
  getProdiStructuralController,
  updateProdiStructuralController,
} from "./prodi-structural.controller";

const route = Router();

// Two file fields share the same multer setup (extension allowlist
// + size limit): the photo (`image`) and the optional signature
// image (`signatureImage`) used on certificates.
const prodiStructuralUpload = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "signatureImage", maxCount: 1 },
]);

route.get("/", CatchWrapper(getProdiStructuralController));
route.get("/:id", CatchWrapper(getProdiStructuralByIdController));
route.post("/", VerifyAdmin, prodiStructuralUpload, CatchWrapper(createProdiStructuralController));
route.put("/:id", VerifyAdmin, prodiStructuralUpload, CatchWrapper(updateProdiStructuralController));
route.delete("/:id", VerifyAdmin, CatchWrapper(deleteProdiStructuralController));

export default route;
