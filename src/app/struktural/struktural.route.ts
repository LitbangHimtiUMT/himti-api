import { Router } from "express";
import { VerifyToken } from "../../middleware/verify-token";
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
  VerifyToken,
  upload.single("image"),
  CatchWrapper(createStrukturalController)
);
route.get("/", VerifyToken, CatchWrapper(getStrukturalController));
route.get(
  "/:structuralId",
  VerifyToken,
  CatchWrapper(getStructuralByIdController)
);
route.delete("/:id", VerifyToken, CatchWrapper(deleteStrukturalController));
route.put(
  "/:id",
  VerifyToken,
  upload.single("image"),
  CatchWrapper(updateStrukturalController)
);

export default route;
