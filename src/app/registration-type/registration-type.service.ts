import { RegistrationEventTypeEnum } from "@prisma/client";
import sharp from "sharp";
import * as registrationTypeRepository from "./registration-type.repository";
import {
  RegistrationTypeCreationDTO,
  RegistrationTypeDTO,
  RegistrationTypeQuery,
  RegistrationTypeUpdateDTO,
} from "./registration-type.interface";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGE_CODE } from "../../utils/error-code";
import { registrationTypeMapper } from "./registration-type.mapper";
import { Meta } from "../../utils/meta";
import {
  BUCKET_FOLDER,
  FileType,
  UploadFileToStorage,
} from "../../utils/upload-file-to-storage";
import { environment } from "../../libs";

export const create = async (
  data: RegistrationTypeCreationDTO & { image?: Express.Multer.File | string }
): Promise<RegistrationTypeDTO> => {
  let filename: string | undefined;
  const { image, ...rest } = data;
  let finalImage: string | undefined;

  if (image) {
    if (typeof image !== "string") {
      const file = image as Express.Multer.File;
      if (file.size > 3 * 1024 * 1024) {
        throw new ErrorApp(
          "Image size exceeds 3MB",
          400,
          MESSAGE_CODE.BAD_REQUEST
        );
      }
      filename = `${file.originalname.replace(
        FileType[file.mimetype] || "",
        ""
      )} - ${+new Date()}.webp`;
      const quality = file.size > 5 * 1024 * 1024 ? 75 : 100;
      const compress = await sharp(file.buffer).webp({ quality }).toBuffer();
      await UploadFileToStorage({
        Bucket: environment.STORAGE.BUCKET,
        Key: `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.registrationType}/${filename}`,
        Body: compress,
        ContentType: "image/webp",
      });
      finalImage = filename;
    } else {
      finalImage = image;
    }
  }

  const registrationType =
    await registrationTypeRepository.createRegistrationTypeRepository({
      ...rest,
      ...(finalImage ? { image: finalImage } : {}),
    });
  return registrationTypeMapper(registrationType);
};

export const getAll = async (query: RegistrationTypeQuery = {}) => {
  const { page = "1", perPage = "10" } = query;
  const [registrationTypes, total] = await Promise.all([
    registrationTypeRepository.getRegistrationTypesRepository(query),
    registrationTypeRepository.getRegistrationTypesCountRepository(query),
  ]);
  const meta = Meta(Number(page), Number(perPage), total);
  return {
    meta,
    data: registrationTypes.map(registrationTypeMapper),
  };
};

export const getById = async (id: string): Promise<RegistrationTypeDTO> => {
  const registrationType =
    await registrationTypeRepository.getRegistrationTypeByIdRepository(id);
  if (!registrationType) {
    throw new ErrorApp(
      "Registration Type not found",
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  return registrationTypeMapper(registrationType);
};

export const update = async (
  id: string,
  data: RegistrationTypeUpdateDTO & { image?: Express.Multer.File | string }
): Promise<RegistrationTypeDTO> => {
  let filename: string | undefined;
  const { image, ...rest } = data;
  let finalImage: string | undefined;

  if (image) {
    if (typeof image !== "string") {
      const file = image as Express.Multer.File;
      if (file.size > 3 * 1024 * 1024) {
        throw new ErrorApp(
          "Image size exceeds 3MB",
          400,
          MESSAGE_CODE.BAD_REQUEST
        );
      }
      filename = `${file.originalname.replace(
        FileType[file.mimetype] || "",
        ""
      )} - ${+new Date()}.webp`;
      const quality = file.size > 5 * 1024 * 1024 ? 75 : 100;
      const compress = await sharp(file.buffer).webp({ quality }).toBuffer();
      await UploadFileToStorage({
        Bucket: environment.STORAGE.BUCKET,
        Key: `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.registrationType}/${filename}`,
        Body: compress,
        ContentType: "image/webp",
      });
      finalImage = filename;
    } else {
      finalImage = image;
    }
  }

  const payloadToUpdate = {
    ...rest,
    ...(finalImage !== undefined ? { image: finalImage } : {}),
  };

  const updatedRegistrationType =
    await registrationTypeRepository.updateRegistrationTypeRepository(
      id,
      payloadToUpdate
    );
  return registrationTypeMapper(updatedRegistrationType);
};

export const remove = async (id: string) => {
  const registrationType = await getById(id);
  if (registrationType instanceof ErrorApp) return registrationType;
  return await registrationTypeRepository.deleteRegistrationTypeRepository(
    registrationType.id
  );
};

export const getEventTypeOptions = () => {
  return Object.values(RegistrationEventTypeEnum).map((value) => ({
    value,
    label: value
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
  }));
};
