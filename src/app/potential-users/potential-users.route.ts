import { Router } from "express";
import {
  createPotentialUserController,
  getPotentialUsersController,
  updatePotentialUserController,
  parseCVController,
} from "./potential-users.controller";
import { CatchWrapper } from "../../utils/catch-wrapper";
import { verifyToken } from "../../middleware/verify-token";
import { upload } from "../../utils/upload-file-to-storage";

const route = Router();

route.get("/", CatchWrapper(getPotentialUsersController));
route.post("/", CatchWrapper(upload.single("photo")), CatchWrapper(createPotentialUserController));
route.put("/", verifyToken, CatchWrapper(updatePotentialUserController));
route.post("/parse-cv", CatchWrapper(parseCVController));

export default route;

