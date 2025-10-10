import { Request, Response, NextFunction } from "express";
import * as EventRegistrationService from "./event-registration.service";
import { HandleResponse } from "../../utils/handle-response";
import { MESSAGE_CODE } from "../../utils/error-code";
import { ErrorApp } from "../../utils/http-error";

export const createEventRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const eventRegistration = await EventRegistrationService.create(req.body);
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
