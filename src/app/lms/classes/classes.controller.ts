import { NextFunction, Request, type Response } from "express";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { HandleResponse } from "../../../utils/handle-response";
import { ErrorApp } from "../../../utils/http-error";
import { MESSAGES } from "../../../utils/messages";
import { createClassService, getClassService } from "./classes.service";
import { RequestWithAccessToken } from "../../../interface/Request";
import { createClassSchema } from "./classes.request";

export const createClassController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const file = req.file as Express.Multer.File;
  const { userId } = req;
  const { body } = req;

  const combine = {
    ...body,
    thumbnail: file,
  };

  const validate = createClassSchema.validate(combine);
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

  const classCtrl = await createClassService(combine, userId as string);

  if (classCtrl instanceof ErrorApp) {
    next(classCtrl);
    return;
  }

  HandleResponse(res, 201, MESSAGE_CODE.SUCCESS, MESSAGES.CREATED.CLASS);
};

export const getClassController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { query } = req;
  const result = await getClassService(query);

  if (result instanceof ErrorApp) {
    next(result);
    return;
  }

  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.CLASS.GET,
    result?.data,
    result?.meta
  );
};
