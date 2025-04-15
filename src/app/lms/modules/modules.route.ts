import { Router } from "express";
import { verifyToken } from "../../../middleware/verify-token";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import { upload } from "../../../utils/upload-file-to-storage";
import {
  createModuleController,
  getDetailModuleController,
  getModulesController,
} from "./modules.controller";

export const moduleRoute = Router();

moduleRoute
  .post(
    "/:sessionId",
    verifyToken(["MENTOR", "SUPER_ADMIN", "ADMIN"]),
    CatchWrapper(upload.single("fileModule")),
    CatchWrapper(createModuleController)
  )
  .get("/session/:sessionId", CatchWrapper(getModulesController))
  .get("/:moduleId", CatchWrapper(getDetailModuleController));
