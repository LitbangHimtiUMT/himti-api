import { NextFunction, type Response } from "express";
import { RequestWithAccessToken } from "../../../interface/Request";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { HandleResponse } from "../../../utils/handle-response";
import { ErrorApp } from "../../../utils/http-error";
import { MESSAGES } from "../../../utils/messages";
import { createModuleService, getModulesService } from "./modules.service";

export const createModuleController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { body } = req;

  const moduleCtrl = await createModuleService(body);

  if (moduleCtrl instanceof ErrorApp) {
    next(moduleCtrl);
    return;
  }

  HandleResponse(res, 201, MESSAGE_CODE.SUCCESS, MESSAGES.CREATED.MODULE);
};

export const getModulesController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { query, params } = req;
  const { sessionId } = params;
  const result = await getModulesService({
    ...query,
    sessionId,
  });
  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.MODULES.GET,
    result?.data,
    result?.meta
  );
};
