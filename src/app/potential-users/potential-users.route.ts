import { Router } from "express";
import {
  createPotentialUserController,
  getPotentialUsersController,
  updatePotentialUserController,
  parseCVController,
} from "./potential-users.controller";
import { CatchWrapper } from "../../utils/catch-wrapper";
import { VerifyAdmin } from "../../middleware/verify-admin";
import { upload } from "../../utils/upload-file-to-storage";

const route = Router();

route.get("/", VerifyAdmin, CatchWrapper(getPotentialUsersController));
route.post("/", VerifyAdmin, CatchWrapper(upload.single("photo")), CatchWrapper(createPotentialUserController));
route.put("/", VerifyAdmin, CatchWrapper(updatePotentialUserController));
route.post("/parse-cv", VerifyAdmin, CatchWrapper(parseCVController));

export default route;

