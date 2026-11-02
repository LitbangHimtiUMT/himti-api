import { Router } from "express";
import { CatchWrapper } from "../../utils/catch-wrapper";
import { VerifyAdmin } from "../../middleware/verify-admin";
import { getHistoriesController } from "./history.controller";

export const historyRoute = Router();

historyRoute.get('/', VerifyAdmin, CatchWrapper(getHistoriesController))