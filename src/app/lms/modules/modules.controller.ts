import { NextFunction, type Response } from "express";
import { RequestWithAccessToken } from "../../../interface/Request";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { HandleResponse } from "../../../utils/handle-response";
import { ErrorApp } from "../../../utils/http-error";
import { MESSAGES } from "../../../utils/messages";
import { createModuleSchema } from "./modules.request";
import {
  createModuleService,
  getDetailModuleService,
  getModulesService,
} from "./modules.service";

export const createModuleController = async (
  req: RequestWithAccessToken & {
    files: {
      fileModule: Express.Multer.File[];
    };
  },
  res: Response,
  next: NextFunction
) => {
  const { body, files, params, userId } = req;
  const { sessionId } = params;

  const combineBodyFile = {
    ...body,
    fileModule: files?.fileModule?.[0] ?? req.file ?? undefined,
    sessionId,
  };
  console.log({ combineBodyFile, files, file: req.file });
  const validate = createModuleSchema.validate(combineBodyFile);
  if (validate.error) {
    next(
      new ErrorApp(
        validate.error.message.replace(/"/g, ""),
        400,
        MESSAGE_CODE.BAD_REQUEST
      )
    );
    return;
  }
  const moduleCtrl = await createModuleService(combineBodyFile, userId);

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
  const { query, params, userId } = req;
  const { sessionId } = params;
  const result = await getModulesService(
    {
      ...query,
      sessionId,
    },
    userId
  );
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

export const getDetailModuleController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { params, userId, mentorId } = req;
  const { moduleId } = params;
  const result = await getDetailModuleService(moduleId, userId, !!mentorId);
  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.MODULES.GET,
    result
  );
};
