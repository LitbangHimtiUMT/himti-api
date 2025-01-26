import { Router } from "express";
import { verifyToken } from "../../middleware/verify-token";
import { CatchWrapper } from "../../utils/catch-wrapper";
import { upload } from "../../utils/upload-file-to-storage";
import { createClassController } from "./classes.controller";

const route = Router();

route.post(
  "/",
  verifyToken(),
  CatchWrapper(upload.single("thumbnail")),
  CatchWrapper(createClassController),
);

export default route;
