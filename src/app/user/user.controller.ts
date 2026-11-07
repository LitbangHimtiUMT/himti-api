import { NextFunction, type Request, type Response } from "express";
import { RequestWithAccessToken } from "../../interface/Request";
import { MESSAGE_CODE } from "../../utils/error-code";
import { HandleResponse } from "../../utils/handle-response";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGES } from "../../utils/messages";
import { getUserById } from "../authentication/auth.repository";
import {
  createUserService,
  deleteUserService,
  getUserService,
  getUsersService,
  getUserWithoutMentorService,
  updateUserService,
  updateUserRoleService,
} from "./user.service";

export const getUsersController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const users = await getUsersService(req.query);
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
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { body, userId } = req;

  // Pass the caller's role so the service can enforce the
  // ADMIN-cannot-mint-ADMIN rule. This route is currently shadowed
  // by GET /:userId (see CHANGELOG), so this is defence in depth
  // for when the route ordering is fixed in Fase 3.
  const caller = userId ? await getUserById(userId) : null;
  const user = await createUserService(body, caller?.role);

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
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;
  const { body } = req;

  // Teruskan peran pemanggil supaya service bisa membuang field `role`
  // dari update bila pemanggil bukan SUPER_ADMIN (pola yang sama dengan
  // createUserController). Request tidak di-403-kan: body.role selalu
  // ada di payload CMS, jadi yang diblokir hanya perubahan role-nya.
  const caller = req.userId ? await getUserById(req.userId) : null;
  const result = await updateUserService(userId, body, caller?.role);
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

export const updateUserRoleController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;
  const { role } = req.body;
  const result = await updateUserRoleService(userId, role);
  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.USER_DATA.UPDATE,
    result
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

// Hapus user lain oleh admin (dipakai CMS: DELETE /user/:id).
// Jangan disamakan dengan deleteUserController di atas: yang itu hapus
// diri sendiri dari token (DELETE /user tanpa id), jadi kalau CMS
// dipaksa ke route itu, yang kehapus malah admin yang login.
export const deleteUserByIdController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;

  // Teruskan identitas pemanggil supaya service bisa menolak hapus
  // akun ADMIN/SUPER_ADMIN oleh ADMIN biasa dan hapus diri sendiri.
  const caller = req.userId ? await getUserById(req.userId) : null;
  const result = await deleteUserService(
    userId ?? "",
    caller?.id,
    caller?.role
  );
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
