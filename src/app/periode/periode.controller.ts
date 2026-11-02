import { Request, Response, NextFunction } from "express";
import { HandleResponse } from "../../utils/handle-response";
import { MESSAGE_CODE } from "../../utils/error-code";
import { ErrorApp } from "../../utils/http-error";
import { createPeriodeSchema, updatePeriodeSchema } from "./periode.request";
import {
  createPeriodService,
  deletePeriodService,
  getActivePeriodService,
  getAllPeriodsService,
  updatePeriodService,
} from "./periode.service";

export const getActivePeriodController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = await getActivePeriodService();
  HandleResponse(res, 200, MESSAGE_CODE.SUCCESS, "Success get active period", result);
};

export const getPeriodsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = await getAllPeriodsService();
  HandleResponse(res, 200, MESSAGE_CODE.SUCCESS, "Success get all periods", result);
};

export const createPeriodController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { body } = req;

  // Parse stringified JSON fields from multipart/form-data
  if (typeof body.mission === "string") {
    try {
      body.mission = JSON.parse(body.mission);
    } catch (e) {
      // Keep as is
    }
  }
  if (body.isActive !== undefined) {
    body.isActive = body.isActive === "true" || body.isActive === true;
  }

  const { error } = createPeriodeSchema.validate(body);
  if (error) {
    return next(new ErrorApp(error.message, 400, MESSAGE_CODE.BAD_REQUEST));
  }

  const result = await createPeriodService(body, req.file);
  if (result instanceof ErrorApp) {
    return next(result);
  }
  HandleResponse(res, 201, MESSAGE_CODE.SUCCESS, "Success create period", result);
};

export const updatePeriodController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { body } = req;

  // Parse stringified JSON fields from multipart/form-data
  if (typeof body.mission === "string") {
    try {
      body.mission = JSON.parse(body.mission);
    } catch (e) {
      // Keep as is
    }
  }
  if (body.isActive !== undefined) {
    body.isActive = body.isActive === "true" || body.isActive === true;
  }

  const { error } = updatePeriodeSchema.validate(body);
  if (error) {
    return next(new ErrorApp(error.message, 400, MESSAGE_CODE.BAD_REQUEST));
  }

  const result = await updatePeriodService(id, body, req.file);
  if (result instanceof ErrorApp) {
    return next(result);
  }
  HandleResponse(res, 200, MESSAGE_CODE.SUCCESS, "Success update period", result);
};

export const deletePeriodController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const result = await deletePeriodService(id);
  if (result instanceof ErrorApp) {
    return next(result);
  }
  HandleResponse(res, 200, MESSAGE_CODE.SUCCESS, "Success delete period", result);
};
