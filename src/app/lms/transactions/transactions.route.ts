import { Router } from "express";
import { CatchWrapper } from "../../../utils/catch-wrapper";
import { callbackClassTransactionController } from "./transactions.controller";

export const transactionRoute = Router();

transactionRoute.post(
  "/callback",
  CatchWrapper(callbackClassTransactionController)
);
