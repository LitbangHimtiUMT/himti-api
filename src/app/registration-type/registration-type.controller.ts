import { Request, Response, NextFunction } from "express";
import { RegistrationEventTypeEnum } from "@prisma/client";
import * as RegistrationTypeService from "./registration-type.service";
import { HandleResponse } from "../../utils/handle-response";
import { MESSAGE_CODE } from "../../utils/error-code";
import { ErrorApp } from "../../utils/http-error";

export const createRegistrationType = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await RegistrationTypeService.create(req.body);
    HandleResponse(
      res,
      201,
      MESSAGE_CODE.SUCCESS,
      "Registration type created successfully"
    );
  } catch (error) {
    if (error instanceof ErrorApp) {
      next(error);
      return;
    }
    HandleResponse(
      res,
      500,
      MESSAGE_CODE.INTERNAL_SERVER_ERROR,
      "Failed to create registration type"
    );
  }
};

export const getRegistrationTypeOptions = async (
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const options = RegistrationTypeService.getEventTypeOptions();
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    "Registration type enums retrieved successfully",
    options
  );
};

export const getRegistrationTypes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { type, isActive, eventId } = req.query;
    const filters = {
      ...(typeof type === "string" && type
        ? { type: type as RegistrationEventTypeEnum }
        : {}),
      ...(typeof isActive === "string" && isActive !== ""
        ? { isActive: isActive === "true" }
        : {}),
      ...(typeof eventId === "string" && eventId ? { eventId } : {}),
    };
    const registrationTypes = await RegistrationTypeService.getAll(filters);
    HandleResponse(
      res,
      200,
      MESSAGE_CODE.SUCCESS,
      "Registration types retrieved successfully",
      registrationTypes
    );
  } catch (error) {
    if (error instanceof ErrorApp) {
      next(error);
      return;
    }
    HandleResponse(
      res,
      500,
      MESSAGE_CODE.INTERNAL_SERVER_ERROR,
      "Failed to retrieve registration types"
    );
  }
};

export const getRegistrationTypeById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const registrationType = await RegistrationTypeService.getById(
      req.params.id
    );
    HandleResponse(
      res,
      200,
      MESSAGE_CODE.SUCCESS,
      "Registration type retrieved successfully",
      registrationType
    );
  } catch (error) {
    if (error instanceof ErrorApp) {
      next(error);
      return;
    }
    HandleResponse(
      res,
      500,
      MESSAGE_CODE.INTERNAL_SERVER_ERROR,
      "Failed to retrieve registration type"
    );
  }
};

export const updateRegistrationType = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const updatedRegistrationType = await RegistrationTypeService.update(
      req.params.id,
      req.body
    );
    HandleResponse(
      res,
      200,
      MESSAGE_CODE.SUCCESS,
      "Registration type updated successfully",
      updatedRegistrationType
    );
  } catch (error) {
    if (error instanceof ErrorApp) {
      next(error);
      return;
    }
    HandleResponse(
      res,
      500,
      MESSAGE_CODE.INTERNAL_SERVER_ERROR,
      "Failed to update registration type"
    );
  }
};

export const deleteRegistrationType = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await RegistrationTypeService.remove(req.params.id);
    HandleResponse(
      res,
      204,
      MESSAGE_CODE.SUCCESS,
      "Registration type deleted successfully"
    );
  } catch (error) {
    if (error instanceof ErrorApp) {
      next(error);
      return;
    }
    HandleResponse(
      res,
      500,
      MESSAGE_CODE.INTERNAL_SERVER_ERROR,
      "Failed to delete registration type"
    );
  }
};
