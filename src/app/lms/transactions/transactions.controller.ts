import { NextFunction, Request, Response } from "express";
import { callbackClassTransaction } from "./transactions.service";
import { HandleResponse } from "../../../utils/handle-response";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { MESSAGES } from "../../../utils/messages";

export const callbackClassTransactionController = async (
  req: Request,
  res: Response,
  _: NextFunction
) => {
  const { body } = req;
  console.log(_);

  const result = await callbackClassTransaction(body);
  console.log(result);
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.TRANSACTION.CALLBACK,
    result
  );
};
