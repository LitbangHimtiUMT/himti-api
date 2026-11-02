import { Request, Response, NextFunction } from "express";
import { HandleResponse } from "../../utils/handle-response";
import { MESSAGE_CODE } from "../../utils/error-code";
import {
  createPotentialUserService,
  getAllPotentialUsersService,
  updatePotentialUserService,
} from "./potential-users.service";
import {
  createPotentialUserSchema,
  updatePotentialUserSchema,
} from "./potential-users.request";
import { ErrorApp } from "../../utils/http-error";
import { parseCVWithAIService } from "./potential-users-ai.service";

export const getPotentialUsersController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = await getAllPotentialUsersService();
  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(res, 200, MESSAGE_CODE.SUCCESS, "Success get data", result);
};

export const createPotentialUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { body } = req;

  // Parse stringified JSON fields from multipart/form-data
  if (typeof body.skills === "string") {
    try {
      body.skills = JSON.parse(body.skills);
    } catch (e) {
      // Keep as is if parsing fails
    }
  }
  if (typeof body.projects === "string") {
    try {
      body.projects = JSON.parse(body.projects);
    } catch (e) {
      // Keep as is
    }
  }
  if (typeof body.education === "string") {
    try {
      body.education = JSON.parse(body.education);
    } catch (e) {
      // Keep as is
    }
  }
  if (body.experienceYear !== undefined) {
    body.experienceYear = Number(body.experienceYear);
  }

  const { error } = createPotentialUserSchema.validate(body);
  if (error) {
    return next(new ErrorApp(error.message, 400, MESSAGE_CODE.BAD_REQUEST));
  }
  const result = await createPotentialUserService(body, req.file);
  if (result instanceof ErrorApp) {
    return next(result);
  }
  HandleResponse(res, 201, MESSAGE_CODE.SUCCESS, "Success create data", result);
};

export const updatePotentialUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { body } = req;
  const { id, ...data } = body;

  if (!id) {
    return next(
      new ErrorApp("ID is required in body", 400, MESSAGE_CODE.BAD_REQUEST)
    );
  }

  const { error } = updatePotentialUserSchema.validate(data);
  if (error) {
    return next(new ErrorApp(error.message, 400, MESSAGE_CODE.BAD_REQUEST));
  }

  const result = await updatePotentialUserService(id, data);
  HandleResponse(res, 200, MESSAGE_CODE.SUCCESS, "Success update data", result);
};

export const parseCVController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { text } = req.body;
  if (!text) {
    return next(
      new ErrorApp("Text content is required in body", 400, MESSAGE_CODE.BAD_REQUEST)
    );
  }

  const result = await parseCVWithAIService(text);
  if (result instanceof ErrorApp) {
    return next(result);
  }

  HandleResponse(res, 200, MESSAGE_CODE.SUCCESS, "Success parse CV", result);
};

