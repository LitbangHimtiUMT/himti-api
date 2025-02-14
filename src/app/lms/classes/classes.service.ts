import { ErrorApp } from "../../../utils/http-error";
import { CreateClassBodyRequest } from "./classes.dto";
import {
  createClassRepository,
  getClassCountRepository,
  getClassRepository,
} from "./classes.repository";
import { createClassValidate } from "./classes.validate";
import { getCategoryById } from "../categories/categories.repository";
import { MESSAGE_CODE } from "../../../utils/error-code";
import {
  BUCKET_FOLDER,
  FileType,
  GetFileFromStorage,
  RemoveFileFromStorage,
  UploadFileToStorage,
} from "../../../utils/upload-file-to-storage";
import sharp from "sharp";
import { environment } from "../../../libs";
import { Query } from "../../../interface/Query";
import { Meta } from "../../../utils/meta";
import { getClassMapper } from "./classes.mapper";
import { orderByData } from "../../../utils/query-utils";
import { MESSAGES } from "../../../utils/messages";
import {
  getClassParticipantByUserIdCountRepository,
  getClassParticipantByUserIdRepository,
} from "../class-participants/class-participants.repository";

export const createClassService = async (
  {
    name,
    description,
    thumbnail,
    level,
    categoryId,
    price,
  }: CreateClassBodyRequest,
  userId: string
) => {
  let fileName;

  try {
    const validate = await createClassValidate(
      {
        categoryId,
        level,
        thumbnail,
        name,
        price,
        description,
      },
      userId
    );

    if (validate instanceof ErrorApp) {
      return validate;
    }

    const category = await getCategoryById(categoryId as string);

    if (!category) {
      return new ErrorApp("Category not found", 404, MESSAGE_CODE.BAD_REQUEST);
    }

    const img = thumbnail as Express.Multer.File;

    fileName = `${img?.originalname.replace(FileType[img.mimetype], "")} - ${+new Date()}.webp`;
    const quality =
      ((thumbnail as unknown as Express.Multer.File)?.size as number) >
      5 * 1024 * 1024
        ? 75
        : 100;
    const compress = await sharp(img.buffer).webp({ quality }).toBuffer();
    await UploadFileToStorage({
      Bucket: environment.STORAGE.BUCKET,
      Key: `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.class}/${fileName}`,
      Body: compress,
      ContentType: FileType["image/webp"],
      ACL: "public-read",
    });

    const createClass = await createClassRepository(
      {
        name,
        description,
        thumbnail: fileName,
        level,
        categoryId,
        price,
      },
      userId
    );

    return createClass;
  } catch (error) {
    console.log({
      error,
    });
    const exist = await GetFileFromStorage(
      `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.class}/${fileName}`
    );
    if (exist.exists) {
      await RemoveFileFromStorage(
        `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.class}/${fileName}`
      );
    }
    return new ErrorApp(
      "Error when create class data or upload file to storage",
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
};

export const getClassService = async (query: Query, userId?: string) => {
  const { page = "1", perPage = "10", orderBy } = query;

  if (orderBy && !orderByData.includes(orderBy)) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.ORDER_BY,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  const [classess, totalData] = await Promise.all([
    getClassRepository(query, userId),
    getClassCountRepository(query, userId),
  ]);

  const meta = Meta(Number(page), Number(perPage), totalData);

  return {
    data: getClassMapper(classess),
    meta,
  };
};

export const getClassUserService = async (userId: string, query: Query) => {
  const { page = "1", perPage = "10" } = query;
  const [classes, totalData] = await Promise.all([
    getClassParticipantByUserIdRepository(userId, query),
    getClassParticipantByUserIdCountRepository(userId, query),
  ]);

  const meta = Meta(Number(page), Number(perPage), totalData);

  return {
    data: classes,
    meta,
  };
};
