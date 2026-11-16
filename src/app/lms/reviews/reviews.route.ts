import { Router } from "express";
import { validateRequest } from "../../../middleware/validate-request";
import {
  optionalAuth,
  verifyToken,
} from "../../../middleware/verify-token";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import {
  createReviewController,
  getClassReviewsController,
} from "./reviews.controller";
import { createReviewSchema } from "./reviews.request";

// Only these two routes exist by design (M27 one-shot rule): there is
// no edit or delete endpoint for reviews, and none may be added here.
export const reviewsRoute = Router();

reviewsRoute
  .get(
    "/class/:classId",
    optionalAuth,
    CatchWrapper(getClassReviewsController)
  )
  .post(
    "/",
    verifyToken,
    validateRequest(createReviewSchema),
    CatchWrapper(createReviewController)
  );
