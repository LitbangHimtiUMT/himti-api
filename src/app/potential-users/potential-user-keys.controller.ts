import { Request, Response, NextFunction } from "express";
import { HandleResponse } from "../../utils/handle-response";
import { MESSAGE_CODE } from "../../utils/error-code";
import { ErrorApp } from "../../utils/http-error";
import {
  createPotentialUserKeyService,
  getPotentialUserKeysService,
  deletePotentialUserKeyService,
} from "./potential-user-keys.service";

export const createKeyController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { body } = req;
  if (!body.key) {
    return next(new ErrorApp("Key is required", 400, MESSAGE_CODE.BAD_REQUEST));
  }
  const result = await createPotentialUserKeyService(body);
  if (result instanceof ErrorApp) {
    return next(result);
  }
  HandleResponse(res, 201, MESSAGE_CODE.SUCCESS, "Success create key", result);
};

export const getKeysController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = await getPotentialUserKeysService();
  HandleResponse(res, 200, MESSAGE_CODE.SUCCESS, "Success get keys", result);
};

export const deleteKeyController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  if (!id) {
    return next(new ErrorApp("ID is required", 400, MESSAGE_CODE.BAD_REQUEST));
  }
  try {
    const result = await deletePotentialUserKeyService(id);
    HandleResponse(res, 200, MESSAGE_CODE.SUCCESS, "Success delete key", result);
  } catch (error: any) {
    next(new ErrorApp(error.message, 500, MESSAGE_CODE.INTERNAL_SERVER_ERROR));
  }
};
