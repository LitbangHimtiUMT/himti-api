import { Router } from "express";
import {
  createKeyController,
  getKeysController,
  deleteKeyController,
} from "./potential-user-keys.controller";
import { CatchWrapper } from "../../utils/catch-wrapper";
import { VerifySuperAdmin } from "../../middleware/verify-super-admin";

const route = Router();

route.post("/", VerifySuperAdmin, CatchWrapper(createKeyController));
route.get("/", VerifySuperAdmin, CatchWrapper(getKeysController));
route.delete("/:id", VerifySuperAdmin, CatchWrapper(deleteKeyController));

export default route;
