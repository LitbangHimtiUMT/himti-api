import { Router } from "express";
import { verifyToken } from "../../../middleware/verify-token";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import { createCompletedClassSchema } from "./completed-classes.request";
import { createCompletedClassController } from "./completed-classes.controller";
import { validateRequest } from "../../../middleware/validate-request";

export const completedClassRoute = Router();

completedClassRoute.post(
  "/",
  verifyToken(["USER", "ANGGOTA", "MENTOR"]),
  validateRequest(createCompletedClassSchema),
  CatchWrapper(createCompletedClassController),
);
