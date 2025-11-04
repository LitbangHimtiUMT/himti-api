import { NextFunction, Response } from "express";
import { RequestWithAccessToken } from "../../interface/Request";
import { createTicketSupportService } from "./ticket-support.repository.service";
import { ErrorApp } from "../../utils/http-error";
import { HandleResponse } from "../../utils/handle-response";
import { MESSAGE_CODE } from "../../utils/error-code";
import { MESSAGES } from "../../utils/messages";
import { validateCombineRequest } from "../../middleware/validate-request";
import { createTicketSupportSchema } from "./ticket-support.request";

export const createTicketSupportController = async (
  req: RequestWithAccessToken & {
    file: Express.Multer.File;
  },
  res: Response,
  next: NextFunction
) => {
  const { userId, body } = req;
  const combine = {
    ...body,
    file: req.file,
  };
  const validate = validateCombineRequest(createTicketSupportSchema, combine);
  if (validate) {
    next(validate);
    return;
  }
  const result = await createTicketSupportService(userId, combine);

  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(
    res,
    201,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.CREATED.TICKET_SUPPORT
  );
};
