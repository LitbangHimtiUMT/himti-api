import { Router } from "express";
import { VerifyAdmin } from "../../middleware/verify-admin";
import { CatchWrapper } from "../../utils/catch-wrapper";
import { upload } from "../../utils/upload-file-to-storage";
import {
  createStrukturalController,
  deleteStrukturalController,
  getStructuralByIdController,
  getStrukturalController,
  updateStrukturalController,
} from "./struktural.controller";

const route = Router();

// Two file fields share the same multer setup (extension allowlist
// + size limit): the photo (`image`) and the optional signature
// image (`signatureImage`) used on certificates.
const structuralUpload = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "signatureImage", maxCount: 1 },
]);

route.post(
  "/",
  VerifyAdmin,
  structuralUpload,
  CatchWrapper(createStrukturalController)
);
route.get("/", CatchWrapper(getStrukturalController));
route.get(
  "/:structuralId",
  CatchWrapper(getStructuralByIdController)
);
route.delete("/:id", VerifyAdmin, CatchWrapper(deleteStrukturalController));
route.put(
  "/:id",
  VerifyAdmin,
  structuralUpload,
  CatchWrapper(updateStrukturalController)
);

export default route;
