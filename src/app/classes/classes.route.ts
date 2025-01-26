import { Router } from "express";
import { validateRequest } from "../../middleware/validate-request";
import { CatchWrapper } from "../../utils/catch-wrapper";
import { createClassController } from "./classes.controller";
import { createClassSchema } from "./classes.request";

const route = Router();

route.post(
  "/",
  validateRequest(createClassSchema),
  CatchWrapper(createClassController),
);

export default route;
