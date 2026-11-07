import { environment } from "../../libs";
import { MESSAGE_CODE } from "../../utils/error-code";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGES } from "../../utils/messages";
import { Meta } from "../../utils/meta";
import {
  BUCKET_FOLDER,
  GetFileFromStorage,
  getFileExtension,
  RemoveFileFromStorage,
  UploadFileToStorage,
} from "../../utils/upload-file-to-storage";
import { getEventById } from "../event/event.repository";
import { SubAcaraBodyDTO, SubAcaraQuery } from "./sub-acara.dto";
import { subAcaraDetailMapper, subAcaraListMapper } from "./sub-acara.mapper";
import {
  createSubAcara,
  deleteSubAcara,
  getSubAcaraById,
  getSubAcaraCount,
  getSubAcaraList,
  updateSubAcara,
} from "./sub-acara.repository";

const parseBool = (value: boolean | string | undefined): boolean | undefined => {
  if (value === undefined) return undefined;
  if (typeof value === "boolean") return value;
  if (value.toLowerCase() === "true") return true;
  if (value.toLowerCase() === "false") return false;
  return undefined;
};

const uploadImage = async (file: Express.Multer.File) => {
  const ext = getFileExtension(file.mimetype, file.originalname);
  const fileName = `${file.originalname.replace(ext, "")} - ${+new Date()}${ext}`;
  await UploadFileToStorage({
    Bucket: environment.STORAGE.BUCKET,
    Key: `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.subAcara}/${fileName}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  });
  return fileName;
};

export const getSubAcaraService = async (query: SubAcaraQuery) => {
  const [data, totalData] = await Promise.all([
    getSubAcaraList(query),
    getSubAcaraCount(query),
  ]);
  return { data: subAcaraListMapper(data), meta: Meta(Number(query.page ?? "1"), Number(query.perPage ?? "10"), totalData) };
};

export const getSubAcaraDetailService = async (id: string) => {
  const item = await getSubAcaraById(id);
  if (!item) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.SUB_ACARA,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  return subAcaraDetailMapper(item);
};

export const createSubAcaraService = async (body: SubAcaraBodyDTO) => {
  const parent = await getEventById(body.eventId as string);
  if (!parent) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.SUB_ACARA,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  let fileName: string | undefined;
  if (body.image && typeof body.image === "object") {
    fileName = await uploadImage(body.image);
  }
  return await createSubAcara({
    ...body,
    image: fileName,
    isOpenAbsen: parseBool(body.isOpenAbsen) ?? false,
  });
};

export const updateSubAcaraService = async (id: string, body: SubAcaraBodyDTO) => {
  const existing = await getSubAcaraById(id);
  if (!existing) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.SUB_ACARA,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  if (body.eventId) {
    const parent = await getEventById(body.eventId);
    if (!parent) {
      return new ErrorApp(
        MESSAGES.ERROR.NOT_FOUND.SUB_ACARA,
        404,
        MESSAGE_CODE.NOT_FOUND
      );
    }
  }
  let fileName: string | undefined;
  if (body.image && typeof body.image === "object") {
    const exist = existing.image
      ? await GetFileFromStorage(
          `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.subAcara}/${existing.image}`
        )
      : { exists: false };
    if (exist.exists) {
      await RemoveFileFromStorage(
        `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.subAcara}/${existing.image}`
      );
    }
    fileName = await uploadImage(body.image);
  }
  return await updateSubAcara(id, {
    ...body,
    ...(fileName && { image: fileName }),
    isOpenAbsen: parseBool(body.isOpenAbsen),
  });
};

export const deleteSubAcaraService = async (id: string) => {
  const existing = await getSubAcaraById(id);
  if (!existing) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.SUB_ACARA,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  if (existing.image) {
    await RemoveFileFromStorage(
      `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.subAcara}/${existing.image}`
    );
  }
  return await deleteSubAcara(id);
};
