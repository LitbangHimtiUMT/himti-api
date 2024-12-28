import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { VerifyToken } from "../../middleware/verifyToken";
import { CatchWrapper } from "../../utils/catch-wrapper";
import { upload as UploadFile } from "../../utils/upload-file-to-storage";
import {
  deletePhotoProfileController,
  getProfileController,
  updatePasswordController,
  updateProfileController,
} from "./profileController";
import { updatePasswordSchema } from "./profileRequest";

const route = Router();

route.get("/", VerifyToken, CatchWrapper(getProfileController));
route.put(
  "/",
  VerifyToken,
  //   validateRequest(updateProfileSchema),
  CatchWrapper(UploadFile.single("photo")),
  CatchWrapper(updateProfileController)
);
route.put(
  "/password",
  VerifyToken,
  validateRequest(updatePasswordSchema),
  CatchWrapper(updatePasswordController)
);
route.delete("/", VerifyToken, CatchWrapper(deletePhotoProfileController));

export default route;
