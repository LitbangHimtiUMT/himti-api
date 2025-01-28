import { Role } from "@prisma/client";
import { NextFunction, type Request, type Response } from "express";
import { RequestWithAccessToken } from "../../interface/Request";
import { MESSAGE_CODE } from "../../utils/error-code";
import { HandleResponse } from "../../utils/handle-response";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGES } from "../../utils/messages";
import {
  createUserService,
  deleteUserService,
  getUserService,
  getUsersService,
  getUserWithoutMentorService,
  updateUserService,
} from "./user.service";

export const getUsersController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { search, role, page, perPage } = req.query;
  const users = await getUsersService({
    page: page ? Number(page) : undefined,
    perPage: perPage ? Number(perPage) : undefined,
    role: role ? (role as Role) : undefined,
    search: search as string,
  });
  if (users instanceof ErrorApp) {
    next(users);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.USER_DATA.GET,
    users.data,
    users.meta
  );
};

export const createUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { body } = req;

  const user = await createUserService(body);

  if (user instanceof ErrorApp) {
    next(user);
    return;
  }
  HandleResponse(res, 201, MESSAGE_CODE.SUCCESS, MESSAGES.CREATED.USER.ACCOUNT);
};

export const getUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;
  const result = await getUserService(userId);

  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.USER_DATA.GET,
    result
  );
};

export const updateUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;
  const { body } = req;
  const result = await updateUserService(userId, body);
  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.USER_DATA.UPDATE
  );
};

export const deleteUserController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;
  const result = await deleteUserService(userId ?? "");
  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.USER_DATA.DELETE
  );
};

export const getUserWithoutMentorController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { query } = req;
  const result = await getUserWithoutMentorService(query);
  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.USER_DATA.GET,
    result?.data,
    result?.meta
  );
};
