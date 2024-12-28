import { NextFunction, type Request, type Response } from "express";
import { MESSAGE_CODE } from "../../utils/error-code";
import { HandleResponse } from "../../utils/handle-response";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGES } from "../../utils/messages";
import { IFilterLecturer, LecturerBodyDTO } from "./lecturersDTO";
import {
  createLecturerService,
  deleteLecturerService,
  getLecturerService,
  updateLecturerService,
} from "./lecturersService";

export const createLecturerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { nidn, name, email, numberPhone, lesson, isActive } =
    req.body as LecturerBodyDTO;

  const dosen = await createLecturerService({
    email,
    isActive,
    lesson,
    name,
    nidn,
    numberPhone,
  });

  if (dosen instanceof ErrorApp) {
    next(dosen);
    return;
  }
  HandleResponse(res, 201, MESSAGE_CODE.SUCCESS, MESSAGES.CREATED.DOSEN);
};

export const getLecturerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { search, page, perPage } = req.query as IFilterLecturer;

  const dosen = await getLecturerService({
    search,
    page: page ? Number(page) : undefined,
    perPage: perPage ? Number(perPage) : undefined,
  });
  if (dosen instanceof ErrorApp) {
    next(dosen);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.DOSEN.GET,
    dosen?.data,
    dosen?.meta
  );
};

export const deleteLecturerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  const dosen = await deleteLecturerService({ id });
  if (dosen instanceof ErrorApp) {
    next(dosen);
    return;
  }
  HandleResponse(res, 200, MESSAGE_CODE.SUCCESS, MESSAGES.SUCCESS.DOSEN.DELETE);
};

export const updateLecturerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { nidn, name, email, numberPhone, lesson, isActive } =
    req.body as LecturerBodyDTO;

  const dosen = await updateLecturerService({
    id,
    email,
    isActive,
    lesson,
    name,
    nidn,
    numberPhone,
  });
  if (dosen instanceof ErrorApp) {
    next(dosen);
    return;
  }
  HandleResponse(res, 200, MESSAGE_CODE.SUCCESS, MESSAGES.SUCCESS.DOSEN.UPDATE);
};
