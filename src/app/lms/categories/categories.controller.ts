import { NextFunction, Request, Response } from "express";
import { createCategoryService } from "./categories.service";
import { ErrorApp } from "../../../utils/http-error";
import { HandleResponse } from "../../../utils/handle-response";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { MESSAGES } from "../../../utils/messages";

export const createCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { body } = req;
  const result = await createCategoryService(body);
  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(res, 201, MESSAGE_CODE.SUCCESS, MESSAGES.CREATED.CATEGORY);
};
