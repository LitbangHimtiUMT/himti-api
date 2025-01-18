import { Router } from "express";
import { validateRequest } from "../../middleware/validate-request";
import { VerifyToken } from "../../middleware/verify-token";
import { CatchWrapper } from "../../utils/catch-wrapper";
import { imageSchema } from "../global/image-request";
import { upload } from "./business.config";
import {
  createMerchandiseController,
  createServiceController,
  getMerchandiseController,
  getServiceController,
} from "./business.controller";
import { createBusinessSchema } from "./business.request";

const route = Router();

// merchandise
route.get("/merchandise", CatchWrapper(getMerchandiseController));
route.post(
  "/merchandise",
  VerifyToken,
  upload.single("image"),
  validateRequest(createBusinessSchema, imageSchema),
  CatchWrapper(createMerchandiseController)
);

// service
route.get("/service", CatchWrapper(getServiceController));
route.post(
  "/service",
  VerifyToken,
  upload.single("image"),
  validateRequest(createBusinessSchema, imageSchema),
  CatchWrapper(createServiceController)
);

export default route;
