import { Router } from "express";
import { verifyToken } from "../../middleware/verify-token";
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
  verifyToken(),
  upload.single("image"),
  CatchWrapper(createStrukturalController)
);
route.get("/", verifyToken(), CatchWrapper(getStrukturalController));
route.get(
  "/:structuralId",
  verifyToken(),
  CatchWrapper(getStructuralByIdController)
);
route.delete("/:id", verifyToken(), CatchWrapper(deleteStrukturalController));
route.put(
  "/:id",
  verifyToken(),
  upload.single("image"),
  CatchWrapper(updateStrukturalController)
);

export default route;
