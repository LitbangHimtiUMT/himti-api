import { Router } from "express";
import {
  RolesEnum,
  verifyRole,
  verifyToken,
} from "../../../middleware/verify-token";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import { upload } from "../../../utils/upload-file-to-storage";
import {
  createModuleController,
  deleteModuleController,
  getDetailModuleController,
  getModulesController,
} from "./modules.controller";

export const moduleRoute = Router();

moduleRoute
  .use(verifyToken)
  .post(
    "/:sessionId",
    verifyRole([RolesEnum.MENTOR, RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN]),
    CatchWrapper(upload.single("fileModule")),
    CatchWrapper(createModuleController)
  )
  .get("/session/:sessionId", CatchWrapper(getModulesController))
  .get(
    "/:moduleId",
    // verifyRole([
    //   RolesEnum.ADMIN,
    //   RolesEnum.SUPER_ADMIN,
    //   RolesEnum.USER,
    //   RolesEnum.MENTOR,
    //   RolesEnum.ANGGOTA,
    // ]),
    CatchWrapper(getDetailModuleController)
  )
  .delete(
    "/:moduleId",
    verifyRole([RolesEnum.MENTOR, RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN]),
    CatchWrapper(deleteModuleController)
  );
