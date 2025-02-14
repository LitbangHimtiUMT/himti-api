import { Router } from "express";
import { verifyToken } from "../../../middleware/verify-token";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import { upload } from "../../../utils/upload-file-to-storage";
import {
  createClassController,
  getClassController,
  getClassUserController,
} from "./classes.controller";

export const classRoute = Router();

classRoute
  .post(
    "/",
    verifyToken(["MENTOR", "SUPER_ADMIN", "ADMIN"]),
    CatchWrapper(upload.single("thumbnail")),
    CatchWrapper(createClassController)
  )
  .get("/", CatchWrapper(getClassController))
  .get(
    "/user",
    verifyToken(["USER", "ANGGOTA", "MENTOR"]),
    CatchWrapper(getClassUserController)
  );
