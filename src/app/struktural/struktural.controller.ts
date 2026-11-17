import { NextFunction, type Request, type Response } from "express";
import { MESSAGE_CODE } from "../../utils/error-code";
import { HandleResponse } from "../../utils/handle-response";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGES } from "../../utils/messages";
import {
  createStrukturalService,
  deleteStrukturalService,
  getStructuralByIdService,
  getStrukturalService,
  updateStrukturalService,
} from "./struktural.service";
import { createStrukturalSchema } from "./struktural.request";

export const createStrukturalController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { body } = req;
  // The route uses upload.fields(), so files arrive grouped by
  // field name instead of a single req.file.
  const files = req.files as unknown as
    | Record<string, Express.Multer.File[]>
    | undefined;
  const combine = { ...body };
  // A string `signatureImage` in the body (old URL, or "") is never
  // a new upload: drop it so only a real multipart file is
  // processed. The service guards this too (isUploadedFile).
  delete combine.signatureImage;
  const imageFile = files?.image?.[0];
  const signatureFile = files?.signatureImage?.[0];
  if (imageFile) {
    combine.image = imageFile;
  }
  if (signatureFile) {
    combine.signatureImage = signatureFile;
  }
  console.log(imageFile, "file");
  const validate = createStrukturalSchema.validate(combine);
  console.log(validate);
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

  const struktural = await createStrukturalService(combine);
  if (struktural instanceof ErrorApp) {
    next(struktural);
    return;
    // return HandleResponse(res, struktural.statusCode, struktural.code, struktural.message)
  }
  HandleResponse(res, 201, MESSAGE_CODE.SUCCESS, MESSAGES.CREATED.STRUKTURAL);
};

export const getStrukturalController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { search, page, perPage, angkatan } = req.query;

  const struktural = await getStrukturalService({
    search: search as string,
    page: page ? Number(page) : undefined,
    perPage: perPage ? Number(perPage) : undefined,
    angkatan: angkatan as string,
  });

  if (struktural instanceof ErrorApp) {
    next(struktural);
    return;
    // return HandleResponse(res, struktural.statusCode, struktural.code, struktural.message)
  }

  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.STRUKTURAL.GET,
    struktural?.data,
    struktural?.meta
  );
};

export const deleteStrukturalController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  const struktural = await deleteStrukturalService({ id });
  if (struktural instanceof ErrorApp) {
    next(struktural);
    return;
    // return HandleResponse(res, struktural.statusCode, struktural.code, struktural.message)
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.STRUKTURAL.DELETE
  );
};

export const updateStrukturalController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { isActive, jabatan, memberId, department } = req.body;
  const files = req.files as unknown as
    | Record<string, Express.Multer.File[]>
    | undefined;

  const struktural = await updateStrukturalService({
    id,
    isActive,
    memberId,
    jabatan,
    department,
    // Upload memakai multer.memoryStorage, jadi file tidak punya `.path`
    // (hanya buffer/originalname/mimetype). Oper objek file-nya, seperti
    // create — sebelumnya `req.file?.path` selalu undefined sehingga
    // foto baru diam-diam tidak pernah tersimpan.
    image: files?.image?.[0],
    signatureImage: files?.signatureImage?.[0],
  });
  if (struktural instanceof ErrorApp) {
    next(struktural);
    return;
    // return HandleResponse(res, struktural.statusCode, struktural.code, struktural.message)
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.STRUKTURAL.UPDATE
  );
};

export const getStructuralByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { structuralId } = req.params;
  const struktural = await getStructuralByIdService(structuralId);
  if (struktural instanceof ErrorApp) {
    next(struktural);
    return;
    // return HandleResponse(res, struktural.statusCode, struktural.code, struktural.message)
  }
  HandleResponse(
    res,
    200,
    MESSAGE_CODE.SUCCESS,
    MESSAGES.SUCCESS.STRUKTURAL.GET,
    struktural
  );
};
