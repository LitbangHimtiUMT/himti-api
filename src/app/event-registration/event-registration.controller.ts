import { Request, Response, NextFunction } from "express";
import * as EventRegistrationService from "./event-registration.service";
import { HandleResponse } from "../../utils/handle-response";
import { MESSAGE_CODE } from "../../utils/error-code";
import { ErrorApp } from "../../utils/http-error";
import { validateCombineRequest } from "../../middleware/validate-request";
import { createEventRegistrationSchema } from "./event-registration.request";

export const createEventRegistration = async (
  req: Request & { file?: Express.Multer.File },
  res: Response,
  next: NextFunction
) => {
  try {
    const combine = {
      ...req.body,
      ...(req.file && {
        image: req.file,
      }),
    };

    const validate = validateCombineRequest(
      createEventRegistrationSchema,
      combine
    );
    if (validate instanceof ErrorApp) {
      return next(validate);
    }
    const eventRegistration = await EventRegistrationService.create(combine);
    if (eventRegistration instanceof ErrorApp) {
      next(eventRegistration);
      return;
    }
    HandleResponse(
      res,
      201,
      MESSAGE_CODE.SUCCESS,
      "Event registration created successfully",
      eventRegistration
    );
  } catch (error) {
    if (error instanceof ErrorApp) {
      return next(error);
    }
    HandleResponse(
      res,
      500,
      MESSAGE_CODE.INTERNAL_SERVER_ERROR,
      "Failed to create event registration"
    );
  }
};

export const getEventRegistrations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const eventRegistrations = await EventRegistrationService.findAll();
    HandleResponse(
      res,
      200,
      MESSAGE_CODE.SUCCESS,
      "Event registrations retrieved successfully",
      eventRegistrations
    );
  } catch (error) {
    if (error instanceof ErrorApp) {
      return next(error);
    }
    HandleResponse(
      res,
      500,
      MESSAGE_CODE.INTERNAL_SERVER_ERROR,
      "Failed to retrieve event registrations"
    );
  }
};

export const getEventRegistrationById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const eventRegistration = await EventRegistrationService.findById(
      req.params.id
    );
    HandleResponse(
      res,
      200,
      MESSAGE_CODE.SUCCESS,
      "Event registration retrieved successfully",
      eventRegistration
    );
  } catch (error) {
    if (error instanceof ErrorApp) {
      return next(error);
    }
    HandleResponse(
      res,
      500,
      MESSAGE_CODE.INTERNAL_SERVER_ERROR,
      "Failed to retrieve event registration"
    );
  }
};

export const updateEventRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const updatedEventRegistration = await EventRegistrationService.update(
      req.params.id,
      req.body
    );
    HandleResponse(
      res,
      200,
      MESSAGE_CODE.SUCCESS,
      "Event registration updated successfully",
      updatedEventRegistration
    );
  } catch (error) {
    if (error instanceof ErrorApp) {
      return next(error);
    }
    HandleResponse(
      res,
      500,
      MESSAGE_CODE.INTERNAL_SERVER_ERROR,
      "Failed to update event registration"
    );
  }
};

export const deleteEventRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await EventRegistrationService.remove(req.params.id);
    HandleResponse(
      res,
      204,
      MESSAGE_CODE.SUCCESS,
      "Event registration deleted successfully"
    );
  } catch (error) {
    if (error instanceof ErrorApp) {
      return next(error);
    }
    HandleResponse(
      res,
      500,
      MESSAGE_CODE.INTERNAL_SERVER_ERROR,
      "Failed to delete event registration"
    );
  }
};

export const getEventRegistrationsByRegistrationType = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { registrationTypeId } = req.params;

    const result = await EventRegistrationService.findByRegistrationType(
      registrationTypeId,
      req.query
    );

    HandleResponse(
      res,
      200,
      MESSAGE_CODE.SUCCESS,
      "Event registrations by registration type retrieved successfully",
      result.data,
      result.meta
    );
  } catch (error) {
    if (error instanceof ErrorApp) {
      return next(error);
    }
    HandleResponse(
      res,
      500,
      MESSAGE_CODE.INTERNAL_SERVER_ERROR,
      "Failed to retrieve event registrations by registration type"
    );
  }
};
// ed47c31f-78a3-4f6d-a2ce-798792d8931f
export const importMembersFromRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { registrationTypeId } = req.params;
    const { generationId } = req.body;

    if (!generationId) {
      throw new ErrorApp(
        "generationId is required in body",
        400,
        MESSAGE_CODE.BAD_REQUEST
      );
    }

    const result = await EventRegistrationService.importMembers(
      registrationTypeId,
      generationId
    );
    HandleResponse(
      res,
      200,
      MESSAGE_CODE.SUCCESS,
      "Members imported successfully",
      result
    );
  } catch (error) {
    if (error instanceof ErrorApp) {
      return next(error);
    }
    HandleResponse(
      res,
      500,
      MESSAGE_CODE.INTERNAL_SERVER_ERROR,
      "Failed to import members"
    );
  }
};
