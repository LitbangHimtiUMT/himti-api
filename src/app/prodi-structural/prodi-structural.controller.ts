import { Request, Response, NextFunction } from "express";
import { HandleResponse } from "../../utils/handle-response";
import { MESSAGE_CODE } from "../../utils/error-code";
import { ErrorApp } from "../../utils/http-error";
import {
  createProdiStructuralSchema,
  updateProdiStructuralSchema,
} from "./prodi-structural.request";
import {
  createProdiStructuralService,
  deleteProdiStructuralService,
  getAllProdiStructuralService,
  updateProdiStructuralService,
} from "./prodi-structural.service";

export const getProdiStructuralController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = await getAllProdiStructuralService();
  HandleResponse(res, 200, MESSAGE_CODE.SUCCESS, "Success get prodi structural list", result);
};

export const createProdiStructuralController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { body } = req;

  if (body.sequence !== undefined) {
    body.sequence = Number(body.sequence);
  }
  if (body.isActive !== undefined) {
    body.isActive = body.isActive === "true" || body.isActive === true;
  }

  const { error } = createProdiStructuralSchema.validate(body);
  if (error) {
    return next(new ErrorApp(error.message, 400, MESSAGE_CODE.BAD_REQUEST));
  }

  const result = await createProdiStructuralService(body, req.file);
  if (result instanceof ErrorApp) {
    return next(result);
  }
  HandleResponse(res, 201, MESSAGE_CODE.SUCCESS, "Success create prodi structural", result);
};

export const updateProdiStructuralController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { body } = req;

  if (body.sequence !== undefined) {
    body.sequence = Number(body.sequence);
  }
  if (body.isActive !== undefined) {
    body.isActive = body.isActive === "true" || body.isActive === true;
  }

  const { error } = updateProdiStructuralSchema.validate(body);
  if (error) {
    return next(new ErrorApp(error.message, 400, MESSAGE_CODE.BAD_REQUEST));
  }

  const result = await updateProdiStructuralService(id, body, req.file);
  if (result instanceof ErrorApp) {
    return next(result);
  }
  HandleResponse(res, 200, MESSAGE_CODE.SUCCESS, "Success update prodi structural", result);
};

export const deleteProdiStructuralController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const result = await deleteProdiStructuralService(id);
  if (result instanceof ErrorApp) {
    return next(result);
  }
  HandleResponse(res, 200, MESSAGE_CODE.SUCCESS, "Success delete prodi structural", result);
};
