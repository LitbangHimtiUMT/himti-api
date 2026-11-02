import { Router } from "express";
import { CatchWrapper } from "../../utils/catch-wrapper";
import { VerifyAdmin } from "../../middleware/verify-admin";

import { validateRequest } from "../../middleware/validate-request";
import {
  createMerchandiseController,
  getMerchandiseController,
  getServiceController,
  uploadImageBusinessController,
} from "./business.controller";
import { createBusinessSchema } from "./business.request";
import { upload } from "../../utils/upload-file-to-storage";

const route = Router();

// merchandise
route.get("/merchandise", CatchWrapper(getMerchandiseController));
route.post(
  "/merchandise",
  VerifyAdmin,
  validateRequest(createBusinessSchema),
  CatchWrapper(createMerchandiseController)
);

route.post(
  "/:businessId",
  VerifyAdmin,
  upload.single("image"),
  CatchWrapper(uploadImageBusinessController)
);

// service
route.get("/service", CatchWrapper(getServiceController));
// route.post(
//   "/service",
//   verifyToken,
//   UploadFile.single("image"),
//   validateRequest(createBusinessSchema, imageSchema),
//   CatchWrapper(createServiceController)
// );

export default route;
