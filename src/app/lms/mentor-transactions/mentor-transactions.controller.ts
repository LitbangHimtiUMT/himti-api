import { NextFunction, Request, Response } from "express";
import { getMentorTransactionsByMentorService } from "./mentor-transactions.service";
import { ErrorApp } from "../../../utils/http-error";
import { HandleResponse } from "../../../utils/handle-response";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { MESSAGES } from "../../../utils/messages";

export const getMentorTransactionsByMentorController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { mentorId } = req.params;
  const result = await getMentorTransactionsByMentorService(
    mentorId,
    req.query
  );

  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.MENTOR_TRANSACTION.GET,
    result?.data,
    result?.meta
  );
};
