import { Router } from "express";
import { CatchWrapper } from "../../utils/catch-wrapper";
import { upload as UploadFile } from "../../utils/upload-file-to-storage";

import {
  createMerchandiseController,
  getMerchandiseController,
  getServiceController,
} from "./business.controller";

const route = Router();

// merchandise
route.get("/merchandise", CatchWrapper(getMerchandiseController));
route.post(
  "/merchandise",
  // verifyToken(),
  UploadFile.array("image"),
  CatchWrapper(createMerchandiseController)
);

// service
route.get("/service", CatchWrapper(getServiceController));
// route.post(
//   "/service",
//   verifyToken(),
//   UploadFile.single("image"),
//   validateRequest(createBusinessSchema, imageSchema),
//   CatchWrapper(createServiceController)
// );

export default route;
