import { NextFunction, type Request, type Response } from "express";
import { Result } from "../../utils/api-response";
import { MESSAGE_CODE } from "../../utils/error-code";
import { HandleResponse } from "../../utils/handle-response";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGES } from "../../utils/messages";
import {
  createAnggotaService,
  deleteAnggotaService,
  getMembersService,
  getMemberByIdService,
  updateAnggotaService,
  exportMembersService,
  getGenerationsListService,
} from "./members.service";
import { AnggotaModelTypes } from "./members.types";

export const createMemberController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { body } = req;

  const anggota = await createAnggotaService(body);
  if (anggota instanceof ErrorApp) {
    next(anggota);
    return;
    // return HandleResponse(res, anggota.statusCode, anggota.code, anggota.message)
  }

  HandleResponse(res, 201, MESSAGE_CODE.CREATED, MESSAGES.CREATED.ANGGOTA);
};

export const getMemberController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { page, perPage, search, angkatan, year, generationId, status, isActive } = req.query;

  // Support both `angkatan` (legacy) and `year` (public) query params.
  const resolvedYear = (year as string) || (angkatan as string);

  // Support both `status` and `isActive` (boolean-like) query params.
  let resolvedStatus = status as string | undefined;
  if (!resolvedStatus && typeof isActive !== "undefined") {
    resolvedStatus = String(isActive) === "true" ? "active" : "nonactive";
  }

  const anggota = await getMembersService({
    page: page ? Number(page) : undefined,
    perPage: perPage ? Number(perPage) : undefined,
    search: search as string,
    year: resolvedYear,
    generationId: generationId as string,
    status: resolvedStatus,
  });

  if (anggota instanceof ErrorApp) {
    next(anggota);
    return;
    // return HandleResponse(res, anggota.statusCode, anggota.code, anggota.message)
  }

  HandleResponse<AnggotaModelTypes[]>(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.ANGGOTA.GET,
    (anggota as unknown as Result<AnggotaModelTypes[]>)?.data,
    (anggota as unknown as Result)?.meta
  );
};

export const deleteMemberController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  const anggota = await deleteAnggotaService(id);
  if (anggota instanceof ErrorApp) {
    next(anggota);
    return;
    // return HandleResponse(res, anggota.statusCode, anggota.code, anggota.message)
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.ANGGOTA.DELETE
  );
};

export const updateMemberController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { body } = req;

  const anggota = await updateAnggotaService({
    id,
    ...body,
  });
  if (anggota instanceof ErrorApp) {
    next(anggota);
    return;
    // return HandleResponse(res, anggota.statusCode, anggota.code, anggota.message)
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.ANGGOTA.UPDATE
  );
};

export const getMemberByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const member = await getMemberByIdService(id as string);
  if (member instanceof ErrorApp) {
    next(member);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.ANGGOTA.GET,
    member
  );
};

export const getGenerationsListController = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = await getGenerationsListService();
  if (result instanceof ErrorApp) {
    next(result);
    return;
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.ANGKATAN.GET,
    result.data
  );
};

export const exportMembersController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { generationId } = req.query;

  const result = await exportMembersService({
    generationId: generationId as string,
  });

  if (result instanceof ErrorApp) {
    next(result);
    return;
  }

  // Set headers for file download
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);

  // Send the buffer
  res.send(result.buffer);
};
