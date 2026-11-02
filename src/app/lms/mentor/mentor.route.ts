import { Router } from "express";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import {
  createMentorController,
  deleteMentorController,
  getMentorByIdController,
  getMentorsController,
} from "./mentor.controller";
import {
  RolesEnum,
  verifyRole,
  verifyToken,
} from "../../../middleware/verify-token";

export const mentorsRoute = Router();

// Mentor list was header-only (verifyKey). LMS MentorGrid and the CMS
// mentor list are both used by logged-in users, so the replacement is
// verifyToken (any authenticated user), not an admin-only gate, which
// would have broken the LMS mentor browsing page.
mentorsRoute
  .get("/", verifyToken, CatchWrapper(getMentorsController))
  .use(verifyToken)
  .post(
    "/:userId",
    verifyRole([RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN]),
    CatchWrapper(createMentorController)
  )
  .get(
    "/:mentorId",
    verifyRole([RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN]),
    CatchWrapper(getMentorByIdController)
  )
  .delete(
    "/:mentorId",
    verifyRole([RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN]),
    CatchWrapper(deleteMentorController)
  );
