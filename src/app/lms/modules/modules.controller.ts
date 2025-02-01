import { NextFunction, type Response } from "express";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { HandleResponse } from "../../../utils/handle-response";
import { ErrorApp } from "../../../utils/http-error";
import { MESSAGES } from "../../../utils/messages";
import { createModuleService } from "./modules.service";
import { RequestWithAccessToken } from "../../../interface/Request";
import { createModuleSchema } from "./modules.request";

export const createModuleController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction,
) => {
  const { body } = req;

  const combine = {
    ...body,
  };

  const validate = createModuleSchema.validate(combine);
  if (validate.error) {
    next(
      new ErrorApp(
        validate.error.message.replace(/"/g, ""),
        400,
        MESSAGE_CODE.BAD_REQUEST,
      ),
    );
    return;
  }

  const moduleCtrl = await createModuleService(combine);

  if (moduleCtrl instanceof ErrorApp) {
    next(moduleCtrl);
    return;
  }

  HandleResponse(res, 201, MESSAGE_CODE.SUCCESS, MESSAGES.CREATED.MODULE);
};
