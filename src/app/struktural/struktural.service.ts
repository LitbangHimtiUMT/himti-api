import dotenv from "dotenv";
import { MESSAGE_CODE } from "../../utils/error-code";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGES } from "../../utils/messages";
import { Meta } from "../../utils/meta";
import { DEPARTMENT_CODES, StructuralBodyDTO } from "./struktural.dto";
import {
  createStructural,
  deleteStructural,
  getStructural,
  getStructuralByAnggotaId,
  getStructuralById,
  getStructuralByJabatan,
  getStructuralCount,
  updateStructural,
} from "./struktural.repository";
import { Jabatan } from "@prisma/client";
import { environment } from "../../libs";
import {
  BUCKET_FOLDER,
  FileType,
  RemoveFileFromStorage,
  UploadFileToStorage,
} from "../../utils/upload-file-to-storage";
import {
  getStructuralDTOMapper,
  StructuralData,
  structuralMapper,
} from "./struktural.mapper";
import { IFilterStructural } from "./struktural.types";
import { strukturalValidate } from "./struktural.validate";
import { uploadSignatureImage } from "../../utils/signature-image-upload";
import sharp from "sharp";

dotenv.config();

export const jabatanChecker = (jabatan: string) => {
  return (
    jabatan === "KETUA_HIMPUNAN" ||
    jabatan === "WAKIL_KETUA_HIMPUNAN" ||
    jabatan === "SEKRETARIS" ||
    jabatan === "BENDAHARA" ||
    jabatan === "KETUA_DEPARTMENT"
  );
};

// Department is optional, but when given it must be one of the
// known codes. The update route has no Joi schema, so the service
// is the enforcement point there; create is also covered by Joi.
export const departmentChecker = (department: string) => {
  return (DEPARTMENT_CODES as readonly string[]).includes(department);
};

// The CMS form sends `department` as "" when nothing is selected
// (its generic FormData loop always includes the field). Coerce
// that to null so "no department" stores as NULL instead of an
// empty string or a validation error.
export const normalizeDepartment = (
  department: string | null | undefined
): string | null | undefined => {
  return department === "" ? null : department;
};

// Only a real multipart file is ever processed as a signature
// image. The CMS form also sends the field as a plain string (the
// old URL, or "") when no new file is chosen; string values must
// be ignored so an edit without a new file keeps the old image.
export const isUploadedFile = (
  value: Express.Multer.File | string | undefined
): value is Express.Multer.File => {
  return (
    !!value &&
    typeof value === "object" &&
    Buffer.isBuffer((value as Express.Multer.File).buffer)
  );
};

export const createStrukturalService = async ({
  memberId,
  jabatan,
  isActive,
  image,
  signatureImage,
  department,
}: StructuralBodyDTO) => {
  const replaceJabatan = jabatan?.toUpperCase().replace(/ /g, "_");
  const validate = await strukturalValidate({
    memberId,
    jabatan: replaceJabatan as Jabatan,
  });
  if (validate instanceof ErrorApp) {
    return new ErrorApp(validate.message, validate.statusCode, validate.code);
  }
  const normalizedDepartment = normalizeDepartment(department);
  if (
    normalizedDepartment !== undefined &&
    normalizedDepartment !== null &&
    !departmentChecker(normalizedDepartment)
  ) {
    return new ErrorApp(
      "Invalid department",
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  const img = image as Express.Multer.File;
  let filename;
  let signatureFilename;

  if (image) {
    const quality =
      ((image as unknown as Express.Multer.File)?.size as number) >
      5 * 1024 * 1024
        ? 75
        : 100;
    const compress = await sharp(img.buffer).webp({ quality }).toBuffer();

    filename = `${img?.originalname.replace(FileType[img.mimetype], "")} - ${+new Date()}.webp`;
    const photoUpload = await UploadFileToStorage({
      Bucket: environment.STORAGE.BUCKET,
      Key: `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.structural}/${filename}`,
      Body: compress,
      ContentType: "image/webp",
    });
    // UploadFileToStorage returns the error instead of throwing,
    // so check it: a failed upload must not leave a DB row
    // pointing at a file that was never stored.
    if (photoUpload instanceof Error) {
      throw new ErrorApp(
        "Failed to upload image",
        500,
        MESSAGE_CODE.INTERNAL_SERVER_ERROR
      );
    }
  }

  if (isUploadedFile(signatureImage)) {
    signatureFilename = await uploadSignatureImage(
      signatureImage,
      BUCKET_FOLDER.structural
    );
  }

  const status =
    typeof isActive !== "undefined" ? JSON.parse(String(isActive)) : undefined;

  const response = await createStructural({
    isActive: status,
    memberId,
    image: filename,
    signatureImage: signatureFilename,
    department: normalizedDepartment,
    jabatan: replaceJabatan as Jabatan,
  });
  return response;
};

export const getStrukturalService = async ({
  search,
  page = 1,
  perPage = 10,
  angkatan,
}: IFilterStructural) => {
  if (environment.UNDER_MAINTENANCE === "YES") {
    return new ErrorApp(
      `Structural ${MESSAGES.ERROR.UNDER_MAINTENANCE.FEATURES}`,
      503,
      MESSAGE_CODE.UNDER_MAINTENANCE
    );
  }

  const [struktural, totalData] = await Promise.all([
    getStructural({ search, page, perPage, angkatan }),
    getStructuralCount({ search, angkatan }),
  ]);

  const meta = Meta(page, perPage, totalData);
  const data = structuralMapper(struktural);

  return { data, meta };
};

export const deleteStrukturalService = async ({ id }: StructuralBodyDTO) => {
  const Struktural = await getStructuralById(id as string);

  if (!Struktural) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.ANGKATAN.NAME,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  const response = await deleteStructural(id as string);
  return response;
};
export const updateStrukturalService = async ({
  id,
  isActive,
  jabatan,
  image,
  signatureImage,
  department,
  memberId,
}: StructuralBodyDTO) => {
  const matchStruktural = await getStructuralById(id as string);
  const replaceJabatan = jabatan?.toUpperCase().replace(/ /g, "_") as Jabatan;
  const jabatanIsValid = jabatanChecker(replaceJabatan);

  if (jabatan && !jabatanIsValid) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.JABATAN,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  const normalizedDepartment = normalizeDepartment(department);
  if (
    normalizedDepartment !== undefined &&
    normalizedDepartment !== null &&
    !departmentChecker(normalizedDepartment)
  ) {
    return new ErrorApp(
      "Invalid department",
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  if (!matchStruktural) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.STRUKTURAL,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  if (memberId || jabatan) {
    const anggotaIsStruktural = await getStructuralByAnggotaId(
      memberId as string
    );
    if (anggotaIsStruktural && anggotaIsStruktural.id !== id) {
      return new ErrorApp(
        MESSAGES.ERROR.ALREADY.ANGGOTA_STRUKTURAL,
        400,
        MESSAGE_CODE.BAD_REQUEST
      );
    }
    const jabatanIsAlready = await getStructuralByJabatan(jabatan as Jabatan);
    if (
      jabatanIsAlready &&
      jabatanIsAlready.id !== id &&
      jabatanIsAlready.jabatan !== "KETUA_DEPARTMENT" &&
      jabatanIsAlready.jabatan !== "SEKRETARIS"
    ) {
      return new ErrorApp(
        MESSAGES.ERROR.ALREADY.JABATAN,
        400,
        MESSAGE_CODE.BAD_REQUEST
      );
    }
  }

  let filename;
  let signatureFilename;

  if (image) {
    const img = image as Express.Multer.File;

    const quality =
      ((image as unknown as Express.Multer.File)?.size as number) >
      5 * 1024 * 1024
        ? 75
        : 100;
    const compress = await sharp(img.buffer).webp({ quality }).toBuffer();

    filename = `${img?.originalname.replace(FileType[img.mimetype], "")} - ${+new Date()}.webp`;

    // Upload the replacement BEFORE removing the old file: if the
    // upload fails, the old photo must still exist. The result is
    // checked because UploadFileToStorage returns errors instead
    // of throwing them.
    const photoUpload = await UploadFileToStorage({
      Bucket: environment.STORAGE.BUCKET,
      Key: `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.structural}/${filename}`,
      Body: compress,
      ContentType: "image/webp",
    });
    if (photoUpload instanceof Error) {
      throw new ErrorApp(
        "Failed to upload image",
        500,
        MESSAGE_CODE.INTERNAL_SERVER_ERROR
      );
    }
    await RemoveFileFromStorage(
      `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.structural}/${matchStruktural.image}`
    );
  }

  if (isUploadedFile(signatureImage)) {
    signatureFilename = await uploadSignatureImage(
      signatureImage,
      BUCKET_FOLDER.structural
    );
    if (matchStruktural.signatureImage) {
      await RemoveFileFromStorage(
        `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.structural}/${matchStruktural.signatureImage}`
      );
    }
  }

  const updateFields: Partial<StructuralBodyDTO> = { id };

  if (isActive !== undefined)
    updateFields.isActive = JSON.parse(String(isActive));
  if (memberId !== undefined) updateFields.memberId = memberId;
  if (jabatan !== undefined) updateFields.jabatan = replaceJabatan;
  if (normalizedDepartment !== undefined)
    updateFields.department = normalizedDepartment;
  // `filename` hanya terisi bila ada file baru yang di-upload; kondisi
  // terbalik di sini (`!image`) membuat foto baru tidak pernah
  // tersimpan ke DB meskipun file sudah naik ke storage.
  if (image) updateFields.image = filename;
  if (isUploadedFile(signatureImage))
    updateFields.signatureImage = signatureFilename;

  const response = await updateStructural(updateFields);

  return response;
};

export const getStructuralByIdService = async (structuralId: string) => {
  const structural = await getStructuralById(structuralId);
  if (!structural) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.STRUKTURAL,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  return getStructuralDTOMapper(structural as unknown as StructuralData);
};
