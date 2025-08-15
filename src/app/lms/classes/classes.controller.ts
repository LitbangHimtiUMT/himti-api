import { NextFunction, type Response } from "express";
import { RequestWithAccessToken } from "../../../interface/Request";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { HandleResponse } from "../../../utils/handle-response";
import { ErrorApp } from "../../../utils/http-error";
import { MESSAGES } from "../../../utils/messages";
import { createClassSchema, updateClassSchema } from "./classes.request";
import {
  createClassService,
  deleteClassessService,
  getClassService,
  getClassUserService,
  getDetailClassByCodeService,
  getDetailClassService,
  joinInvitationClassService,
  publishClassService,
  updateClassService,
  userJoinClassService,
} from "./classes.service";

export const createClassController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const file = req.file as Express.Multer.File;
  const { userId } = req;
  const { body } = req;
  console.log({ file });
  const combine = {
    ...body,
    thumbnail: file,
  };

  const validate = createClassSchema.validate(combine);
  if (validate.error) {
    next(
      new ErrorApp(
        validate.error.message.replace(/"/g, ""),
        400,
        MESSAGE_CODE.BAD_REQUEST
      )
    );
    return;
  }

  const classCtrl = await createClassService(combine, userId as string);

  if (classCtrl instanceof ErrorApp) {
    next(classCtrl);
    return;
  }

  HandleResponse(res, 201, MESSAGE_CODE.SUCCESS, MESSAGES.CREATED.CLASS);
};

export const updateClassController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const file = req?.file as Express.Multer.File;
  const { body, params } = req;
  console.log({ file });
  const combine = {
    ...body,
    thumbnail: file,
  };

  const validate = updateClassSchema.validate(combine);
  if (validate.error) {
    next(
      new ErrorApp(
        validate.error.message.replace(/"/g, ""),
        400,
        MESSAGE_CODE.BAD_REQUEST
      )
    );
    return;
  }

  const classCtrl = await updateClassService(params?.classId, combine);

  if (classCtrl instanceof ErrorApp) {
    next(classCtrl);
    return;
  }

  HandleResponse(res, 200, MESSAGE_CODE.SUCCESS, MESSAGES.SUCCESS.CLASS.UPDATE);
};

export const getClassController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { query, userId } = req;
  const result = await getClassService(query, userId);

  if (result instanceof ErrorApp) {
    next(result);
    return;
  }

  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.CLASS.GET,
    result?.data,
    result?.meta
  );
};

export const getClassUserController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { query, userId } = req;
  const result = await getClassUserService(userId ?? "", query);
  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.CLASS.GET,
    result?.data,
    result?.meta
  );
};

export const userJoinClassController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { params, userId } = req;
  const { classId } = params;
  const result = await userJoinClassService(userId ?? "", classId);
  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.CLASS.JOIN,
    result
  );
};

export const getDetailClassController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { userId, params, query } = req;
  const { classId } = params;
  const result = await getDetailClassService(query, classId, userId);
  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.CLASS.GET,
    result.data,
    result.meta
  );
};

export const getDetailClassByCodeController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { params, userId } = req;
  const { code } = params;
  const result = await getDetailClassByCodeService(userId ?? "", code);
  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.CLASS.GET,
    result
  );
};

export const joinInvitationClassController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { userId, body } = req;

  const result = await joinInvitationClassService(userId ?? "", body);
  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  console.log({ result });
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.CLASS.JOIN,
    result
  );
};

export const publishClassController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { params, userId } = req;
  const { classId } = params;
  const result = await publishClassService(classId, userId ?? "");
  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.CLASS.PUBLISH
  );
};

export const deleteClassessController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { params, userId } = req;
  const { classId } = params;
  const result = await deleteClassessService(classId, userId);
  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(res, 200, MESSAGE_CODE.SUCCESS, MESSAGES.SUCCESS.CLASS.DELETE);
};
