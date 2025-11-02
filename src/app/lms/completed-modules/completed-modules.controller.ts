import { NextFunction, type Response } from "express";
import { RequestWithAccessToken } from "../../../interface/Request";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { HandleResponse } from "../../../utils/handle-response";
import { ErrorApp } from "../../../utils/http-error";
import { MESSAGES } from "../../../utils/messages";
import { createCompletedModuleService } from "./completed-modules.service";

export const createCompletedModuleController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { userId, params } = req;
  const { moduleId } = params;

  const completedModule = await createCompletedModuleService({
    moduleId,
    userId: userId ?? "",
  });

  if (completedModule instanceof ErrorApp) {
    next(completedModule);
    return;
  }

  HandleResponse(
    res,
    201,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.CREATED.COMPLETED_MODULE
  );
};
