import { Router } from "express";
import {
  getVersionController,
  updateVersionController,
} from "./version.controller";
import { CatchWrapper } from "../../utils/catch-wrapper";
import { verifyToken } from "../../middleware/verify-token";

const route = Router();
route
  .get("/", CatchWrapper(getVersionController))
  .use(verifyToken)
  .put("/:versionId", CatchWrapper(updateVersionController));

export default route;
