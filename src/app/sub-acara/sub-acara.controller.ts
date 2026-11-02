import { NextFunction, Request, Response } from "express";
import { MESSAGE_CODE } from "../../utils/error-code";
import { HandleResponse } from "../../utils/handle-response";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGES } from "../../utils/messages";
import {
  createSubAcaraSchema,
  updateSubAcaraSchema,
} from "./sub-acara.request";
import {
  createSubAcaraService,
  deleteSubAcaraService,
  getSubAcaraDetailService,
  getSubAcaraService,
  updateSubAcaraService,
} from "./sub-acara.service";

export const getSubAcaraController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = await getSubAcaraService(req.query);
  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.SUB_ACARA.GET,
    result.data,
    result.meta
  );
};

export const getSubAcaraDetailController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = await getSubAcaraDetailService(req.params.id);
  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(res, 200, MESSAGE_CODE.SUCCESS, MESSAGES.SUCCESS.SUB_ACARA.GET, result);
};

const withFile = (req: Request) => {
  const body = { ...req.body };
  const file = (req as Request & { file?: Express.Multer.File }).file;
  if (file) body.image = file;
  return body;
};

export const createSubAcaraController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const validate = createSubAcaraSchema.validate(withFile(req));
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
  const result = await createSubAcaraService(validate.value);
  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(res, 201, MESSAGE_CODE.SUCCESS, MESSAGES.CREATED.SUB_ACARA);
};

export const updateSubAcaraController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const validate = updateSubAcaraSchema.validate(withFile(req));
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
  const result = await updateSubAcaraService(req.params.id, validate.value);
  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(res, 200, MESSAGE_CODE.SUCCESS, MESSAGES.SUCCESS.SUB_ACARA.UPDATE);
};

export const deleteSubAcaraController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = await deleteSubAcaraService(req.params.id);
  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(res, 200, MESSAGE_CODE.SUCCESS, MESSAGES.SUCCESS.SUB_ACARA.DELETE);
};
