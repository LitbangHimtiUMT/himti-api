import { Router } from "express";
import { validateRequest } from "../../middleware/validate-request";
import { verifyToken } from "../../middleware/verify-token";
import { CatchWrapper } from "../../utils/catch-wrapper";
import { upload as UploadFile } from "../../utils/upload-file-to-storage";
import {
  deletePhotoProfileController,
  getProfileController,
  updatePasswordController,
  updateProfileController,
} from "./profile.controller";
import { updatePasswordSchema } from "./profile.request";

const route = Router();

route.get("/", verifyToken(), CatchWrapper(getProfileController));
route.put(
  "/",
  verifyToken(),
  //   validateRequest(updateProfileSchema),
  CatchWrapper(UploadFile.single("photo")),
  CatchWrapper(updateProfileController)
);
route.put(
  "/password",
  verifyToken(),
  validateRequest(updatePasswordSchema),
  CatchWrapper(updatePasswordController)
);
route.delete("/", verifyToken(), CatchWrapper(deletePhotoProfileController));

export default route;
