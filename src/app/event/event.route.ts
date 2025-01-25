import { Router } from "express";
import { verifyToken } from "../../middleware/verify-token";
import { CatchWrapper } from "../../utils/catch-wrapper";
import { upload as UploadFile } from "../../utils/upload-file-to-storage";
import {
  createEventController,
  deleteEventController,
  getDetailEventController,
  getEventController,
  updateEventController,
} from "./event.controller";

const route = Router();

route.post(
  "/",
  verifyToken(),
  CatchWrapper(UploadFile.single("image")),
  CatchWrapper(createEventController)
);
route.get("/", CatchWrapper(getEventController));
route.delete("/:id", verifyToken(), CatchWrapper(deleteEventController));
route.put(
  "/:id",
  verifyToken(),
  CatchWrapper(UploadFile.single("image")),
  CatchWrapper(updateEventController)
);
route.get("/:id", CatchWrapper(getDetailEventController));

export default route;
