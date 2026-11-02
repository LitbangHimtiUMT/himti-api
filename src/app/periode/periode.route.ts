import { Router } from "express";
import { CatchWrapper } from "../../utils/catch-wrapper";
import { VerifyAdmin } from "../../middleware/verify-admin";
import { upload } from "../../utils/upload-file-to-storage";
import {
  createPeriodController,
  deletePeriodController,
  getActivePeriodController,
  getPeriodsController,
  updatePeriodController,
} from "./periode.controller";

const route = Router();

route.get("/active", CatchWrapper(getActivePeriodController));
route.get("/", CatchWrapper(getPeriodsController));
route.post("/", VerifyAdmin, upload.single("logo"), CatchWrapper(createPeriodController));
route.put("/:id", VerifyAdmin, upload.single("logo"), CatchWrapper(updatePeriodController));
route.delete("/:id", VerifyAdmin, CatchWrapper(deletePeriodController));

export default route;
