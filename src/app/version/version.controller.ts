import { NextFunction, Request, Response } from "express";
import { MESSAGE_CODE } from "../../utils/error-code";
import { HandleResponse } from "../../utils/handle-response";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGES } from "../../utils/messages";
import { getVersionService, updateVersionService } from "./version.service";

export const updateVersionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { body } = req;
  const { versionId } = req.params;
  const version = await updateVersionService(Number(versionId), body);
  if (version instanceof ErrorApp) {
    next(version);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.VERSION.UPDATE
  );
};

export const getVersionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const version = await getVersionService();

  if (version instanceof ErrorApp) {
    next(version);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.VERSION.GET,
    version
  );
};
