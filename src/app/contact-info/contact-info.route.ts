import { Router } from "express";
import { CatchWrapper } from "../../utils/catch-wrapper";
import { VerifyAdmin } from "../../middleware/verify-admin";
import {
  batchUpsertContactsController,
  createContactController,
  deleteContactController,
  getContactByIdController,
  getContactsController,
  updateContactController,
} from "./contact-info.controller";

const route = Router();

route.get("/", CatchWrapper(getContactsController));
// GET /:id di bawah PUT /batch: "batch" adalah path PUT, bukan GET,
// jadi tidak ada bentrokan — tapi GET /:id tetap ditulis setelah
// GET / supaya jelas urutannya.
route.get("/:id", CatchWrapper(getContactByIdController));
route.post("/", VerifyAdmin, CatchWrapper(createContactController));
route.put("/batch", VerifyAdmin, CatchWrapper(batchUpsertContactsController));
route.put("/:id", VerifyAdmin, CatchWrapper(updateContactController));
route.delete("/:id", VerifyAdmin, CatchWrapper(deleteContactController));

export default route;
