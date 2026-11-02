import { Request, Response, NextFunction } from "express";
import { HandleResponse } from "../../utils/handle-response";
import { MESSAGE_CODE } from "../../utils/error-code";
import { ErrorApp } from "../../utils/http-error";
import {
  createContactInfoSchema,
  updateContactInfoSchema,
  batchUpdateContactInfoSchema,
} from "./contact-info.request";
import {
  batchUpsertContactsService,
  createContactService,
  deleteContactService,
  getAllContactsService,
  updateContactService,
} from "./contact-info.service";

export const getContactsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = await getAllContactsService();
  HandleResponse(res, 200, MESSAGE_CODE.SUCCESS, "Success get contacts", result);
};

export const createContactController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { body } = req;
  const { error } = createContactInfoSchema.validate(body);
  if (error) {
    return next(new ErrorApp(error.message, 400, MESSAGE_CODE.BAD_REQUEST));
  }
  const result = await createContactService(body);
  if (result instanceof ErrorApp) {
    return next(result);
  }
  HandleResponse(res, 201, MESSAGE_CODE.SUCCESS, "Success create contact", result);
};

export const updateContactController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { body } = req;
  const { error } = updateContactInfoSchema.validate(body);
  if (error) {
    return next(new ErrorApp(error.message, 400, MESSAGE_CODE.BAD_REQUEST));
  }
  const result = await updateContactService(id, body);
  if (result instanceof ErrorApp) {
    return next(result);
  }
  HandleResponse(res, 200, MESSAGE_CODE.SUCCESS, "Success update contact", result);
};

export const deleteContactController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const result = await deleteContactService(id);
  if (result instanceof ErrorApp) {
    return next(result);
  }
  HandleResponse(res, 200, MESSAGE_CODE.SUCCESS, "Success delete contact", result);
};

export const batchUpsertContactsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { body } = req;
  const { error } = batchUpdateContactInfoSchema.validate(body);
  if (error) {
    return next(new ErrorApp(error.message, 400, MESSAGE_CODE.BAD_REQUEST));
  }
  const result = await batchUpsertContactsService(body);
  HandleResponse(res, 200, MESSAGE_CODE.SUCCESS, "Success batch update contacts", result);
};
