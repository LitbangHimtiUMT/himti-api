import { Request, Response, NextFunction } from "express";
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

export const getRegistrationTypes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const registrationTypes = await RegistrationTypeService.getAll();
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
      200,
      MESSAGE_CODE.SUCCESS,
      "Registration type deleted successfully"
    );
  } catch (error) {
    console.log({ error });
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
