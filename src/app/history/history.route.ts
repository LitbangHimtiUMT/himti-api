import { Router } from "express";
import { CatchWrapper } from "../../utils/catch-wrapper";
import { getHistoriesController } from "./history.controller";

export const historyRoute = Router();

historyRoute.get('/', CatchWrapper(getHistoriesController))