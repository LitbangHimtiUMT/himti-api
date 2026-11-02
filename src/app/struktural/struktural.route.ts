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

route.post(
  "/",
  VerifyAdmin,
  upload.single("image"),
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
  upload.single("image"),
  CatchWrapper(updateStrukturalController)
);

export default route;
