import { ErrorApp } from "../../utils/http-error";
import { CreateClassBodyRequest } from "./classes.dto";
import { createClassRepository } from "./classes.repository";
import { createClassValidate } from "./classes.validate";
import { getCategoryById } from "../lms/categories/categories.repository";
import { MESSAGE_CODE } from "../../utils/error-code";
import {
  BUCKET_FOLDER,
  FileType,
  GetFileFromStorage,
  RemoveFileFromStorage,
  UploadFileToStorage,
} from "../../utils/upload-file-to-storage";
import sharp from "sharp";
import { environment } from "../../libs";

export const createClassService = async (
  {
    name,
    description,
    thumbnail,
    level,
    categoryId,
    price,
  }: CreateClassBodyRequest,
  userId: string,
) => {
  let fileName;

  try {
    const validate = await createClassValidate(
      {
        categoryId,
        level,
        thumbnail,
      },
      userId,
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

    console.log({
      name,
      fileName,
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
      userId,
    );

    return createClass;
  } catch (error) {
    console.log({
      error,
    });
    const exist = await GetFileFromStorage(
      `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.class}/${fileName}`,
    );
    if (exist.exists) {
      await RemoveFileFromStorage(
        `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.class}/${fileName}`,
      );
    }
    return new ErrorApp(
      "Error when create class data or upload file to storage",
      400,
      MESSAGE_CODE.BAD_REQUEST,
    );
  }
};
