import sharp from "sharp";
import {
  createProdiStructural,
  deleteProdiStructural,
  findAllProdiStructural,
  findProdiStructuralById,
  updateProdiStructural,
} from "./prodi-structural.repository";
import { CreateProdiStructuralDTO, UpdateProdiStructuralDTO } from "./prodi-structural.dto";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGE_CODE } from "../../utils/error-code";
import { ImagePath } from "../../utils/image-path";
import { environment } from "../../libs";
import {
  FileType,
  RemoveFileFromStorage,
  UploadFileToStorage,
} from "../../utils/upload-file-to-storage";

export const getAllProdiStructuralService = async () => {
  const list = await findAllProdiStructural();
  return list.map((item) => ({
    ...item,
    image: item.image ? ImagePath(`prodi-structural/${item.image}`) : null,
  }));
};

export const createProdiStructuralService = async (
  data: CreateProdiStructuralDTO,
  imageFile?: Express.Multer.File
) => {
  let imageName = null;
  if (imageFile) {
    imageName = `${imageFile.originalname.replace(FileType[imageFile.mimetype], "")}-${+new Date()}.webp`;
    const quality = imageFile.size > 5 * 1024 * 1024 ? 75 : 100;
    const compress = await sharp(imageFile.buffer).webp({ quality }).toBuffer();

    await UploadFileToStorage({
      Bucket: environment.STORAGE.BUCKET,
      Key: `${environment.STORAGE.BUCKET_FOLDER}/prodi-structural/${imageName}`,
      Body: compress,
      ContentType: "image/webp",
    });
  }

  return await createProdiStructural({
    ...data,
    image: imageName || undefined,
  });
};

export const updateProdiStructuralService = async (
  id: string,
  data: UpdateProdiStructuralDTO,
  imageFile?: Express.Multer.File
) => {
  const existing = await findProdiStructuralById(id);
  if (!existing) {
    return new ErrorApp("Prodi structural record not found", 404, MESSAGE_CODE.NOT_FOUND);
  }

  let imageName = existing.image;
  if (imageFile) {
    imageName = `${imageFile.originalname.replace(FileType[imageFile.mimetype], "")}-${+new Date()}.webp`;
    const quality = imageFile.size > 5 * 1024 * 1024 ? 75 : 100;
    const compress = await sharp(imageFile.buffer).webp({ quality }).toBuffer();

    if (existing.image) {
      try {
        await RemoveFileFromStorage(`${environment.STORAGE.BUCKET_FOLDER}/prodi-structural/${existing.image}`);
      } catch (err) {
        console.error("Failed to remove old prodi structural image:", err);
      }
    }

    await UploadFileToStorage({
      Bucket: environment.STORAGE.BUCKET,
      Key: `${environment.STORAGE.BUCKET_FOLDER}/prodi-structural/${imageName}`,
      Body: compress,
      ContentType: "image/webp",
    });
  }

  return await updateProdiStructural(id, {
    ...data,
    image: imageName || undefined,
  });
};

export const deleteProdiStructuralService = async (id: string) => {
  const existing = await findProdiStructuralById(id);
  if (!existing) {
    return new ErrorApp("Prodi structural record not found", 404, MESSAGE_CODE.NOT_FOUND);
  }

  if (existing.image) {
    try {
      await RemoveFileFromStorage(`${environment.STORAGE.BUCKET_FOLDER}/prodi-structural/${existing.image}`);
    } catch (err) {
      console.error("Failed to remove image on delete prodi structural:", err);
    }
  }

  await deleteProdiStructural(id);
  return null;
};
