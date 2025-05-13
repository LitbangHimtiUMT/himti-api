import { NextFunction, type Request, type Response } from "express";
import { RequestWithAccessToken } from "../../interface/Request";
import { MESSAGE_CODE } from "../../utils/error-code";
import { HandleResponse } from "../../utils/handle-response";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGES } from "../../utils/messages";
import { createAttendanceSchema } from "./attendances.request";
import {
  createAttendanceService,
  generateCertificateByMeetingAttendanceService,
  getAttendanceByIdService,
  getAttendanceService,
  getAttendancesService,
} from "./attendances.service";

export const createAttendanceController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const file = req.file as Express.Multer.File;
  const { userId } = req;
  const { body } = req;
  const combine = {
    ...body,
    image: file,
  };

  const validate = createAttendanceSchema.validate(combine);
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

  const absensi = await createAttendanceService(combine, userId as string);

  if (absensi instanceof ErrorApp) {
    next(absensi);
    return;
  }
  HandleResponse(res, 201, MESSAGE_CODE.SUCCESS, MESSAGES.CREATED.ABSENSI);
};

export const getAttendanceController = async (
  req: RequestWithAccessToken,
  res: Response,
  next: NextFunction
) => {
  const { query } = req;
  const { userId } = req;

  const absensi = await getAttendanceService({
    ...query,
    userId,
  });
  if (absensi instanceof ErrorApp) {
    next(absensi);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.ABSENSI.GET,
    absensi
  );
};

export const getAttendanceByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const absensi = await getAttendanceByIdService(Number(id));
  if (absensi instanceof ErrorApp) {
    next(absensi);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.ABSENSI.GET,
    absensi
  );
};

export const getAttendancesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { meetingId } = req.params;
  const { query } = req;

  const absensies = await getAttendancesService({
    ...query,
    meetingId,
  });
  if (absensies instanceof ErrorApp) {
    next(absensies);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.ABSENSI.GET,
    absensies.data,
    absensies.meta
  );
};

export const generateCertificateByMeetingAttendanceController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const file = req?.file as Express.Multer.File;

  const { params, query } = req;
  if (!file) {
    next(new ErrorApp("File not found", 400, MESSAGE_CODE.BAD_REQUEST));
    return;
  }

  const result = await generateCertificateByMeetingAttendanceService(
    res,
    params?.meetingId ?? "",
    file,
    query
  );
  console.log({ result });
  return result;
};
