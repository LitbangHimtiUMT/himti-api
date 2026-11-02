import { Router } from "express";
import { VerifyAdmin } from "../../middleware/verify-admin";
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
  VerifyAdmin,
  CatchWrapper(UploadFile.single("image")),
  CatchWrapper(createEventController)
);
route.get("/", CatchWrapper(getEventController));
route.delete("/:id", VerifyAdmin, CatchWrapper(deleteEventController));
route.put(
  "/:id",
  VerifyAdmin,
  CatchWrapper(UploadFile.single("image")),
  CatchWrapper(updateEventController)
);
route.get("/:id", CatchWrapper(getDetailEventController));

export default route;
