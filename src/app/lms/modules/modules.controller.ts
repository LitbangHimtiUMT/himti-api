import { NextFunction, type Response } from "express";
import { RequestWithAccessToken } from "../../../interface/Request";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { HandleResponse } from "../../../utils/handle-response";
import { ErrorApp } from "../../../utils/http-error";
import { MESSAGES } from "../../../utils/messages";
import { createModuleService } from "./modules.service";

export const createModuleController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction,
) => {
  const { body } = req;

  const moduleCtrl = await createModuleService(body);

  if (moduleCtrl instanceof ErrorApp) {
    next(moduleCtrl);
    return;
  }

  HandleResponse(res, 201, MESSAGE_CODE.SUCCESS, MESSAGES.CREATED.MODULE);
};
