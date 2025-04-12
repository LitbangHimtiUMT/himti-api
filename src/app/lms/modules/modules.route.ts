import { Router } from "express";
import { verifyToken } from "../../../middleware/verify-token";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import { upload } from "../../../utils/upload-file-to-storage";
import {
  createModuleController,
  getModulesController,
} from "./modules.controller";

export const moduleRoute = Router();

moduleRoute
  .post(
    "/",
    verifyToken(["MENTOR", "SUPER_ADMIN", "ADMIN"]),
    CatchWrapper(upload.single("file")),
    CatchWrapper(createModuleController)
  )
  .get("/session/:sessionId", CatchWrapper(getModulesController));
