import { Router } from "express";
import {
  RolesEnum,
  verifyRole,
  verifyToken,
} from "../../../middleware/verify-token";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import { getDashboardStatsController } from "./dashboard.controller";

export const dashboardRoute = Router();

dashboardRoute.use(verifyToken).get(
  "/stats",
  verifyRole([RolesEnum.MENTOR, RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN]),
  CatchWrapper(getDashboardStatsController)
);
