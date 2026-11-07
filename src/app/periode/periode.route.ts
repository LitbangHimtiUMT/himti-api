import { Router } from "express";
import { CatchWrapper } from "../../utils/catch-wrapper";
import { VerifyAdmin } from "../../middleware/verify-admin";
import { upload } from "../../utils/upload-file-to-storage";
import {
  createPeriodController,
  deletePeriodController,
  getActivePeriodController,
  getPeriodByIdController,
  getPeriodsController,
  updatePeriodController,
} from "./periode.controller";

const route = Router();

// GET /active harus tetap di atas GET /:id supaya "active" tidak
// ditangkap sebagai :id.
route.get("/active", CatchWrapper(getActivePeriodController));
route.get("/", CatchWrapper(getPeriodsController));
route.get("/:id", CatchWrapper(getPeriodByIdController));
route.post("/", VerifyAdmin, upload.single("logo"), CatchWrapper(createPeriodController));
route.put("/:id", VerifyAdmin, upload.single("logo"), CatchWrapper(updatePeriodController));
route.delete("/:id", VerifyAdmin, CatchWrapper(deletePeriodController));

export default route;
