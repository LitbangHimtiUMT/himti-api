import { Router } from "express";
import { CatchWrapper } from "../../utils/catch-wrapper";
import { VerifyAdmin } from "../../middleware/verify-admin";
import {
  batchUpsertContactsController,
  createContactController,
  deleteContactController,
  getContactsController,
  updateContactController,
} from "./contact-info.controller";

const route = Router();

route.get("/", CatchWrapper(getContactsController));
route.post("/", VerifyAdmin, CatchWrapper(createContactController));
route.put("/batch", VerifyAdmin, CatchWrapper(batchUpsertContactsController));
route.put("/:id", VerifyAdmin, CatchWrapper(updateContactController));
route.delete("/:id", VerifyAdmin, CatchWrapper(deleteContactController));

export default route;
