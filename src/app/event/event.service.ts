import { Event } from "@prisma/client";
import dotenv from "dotenv";
import { Query } from "../../interface/Query";
import sharp from "sharp";
import { environment } from "../../libs";
import { MESSAGE_CODE } from "../../utils/error-code";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGES } from "../../utils/messages";
import { Meta } from "../../utils/meta";
import {
  BUCKET_FOLDER,
  FileType,
  RemoveFileFromStorage,
  UploadFileToStorage,
} from "../../utils/upload-file-to-storage";
import { CreateEventBodyRequest, EventBodyDTO } from "./event.dto";
import { eventDTOMapper, eventsDTOMapper } from "./event.mapper";
import {
  createEvent,
  getEventById,
  getEventCount,
  getEvents,
  sofDeleteEvent,
  updateEvent,
} from "./event.repository";

dotenv.config();

export const openValue = (open?: string) => {
  if (open?.toLowerCase().includes("true")) {
    return true;
  } else if (open?.toLowerCase().includes("false")) {
    return false;
  }
  return undefined;
};

export const createEventService = async ({
  name,
  description,
  endTime,
  image,
  isOpen,
  startTime,
}: CreateEventBodyRequest) => {
  let filename;
  if (isOpen && !startTime) {
    return new ErrorApp(
      MESSAGES.ERROR.REQUIRED.START_DATE,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  if (isOpen && !endTime) {
    return new ErrorApp(
      MESSAGES.ERROR.REQUIRED.END_DATE,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  if (
    ((image as unknown as Express.Multer.File)?.size as number) >
    7 * 1024 * 1024
  ) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.IMAGE_SIZE,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  try {
    const open =
      typeof isOpen !== "undefined" ? JSON.parse(String(isOpen)) : undefined;

    const img = image as Express.Multer.File;
    filename = `${img?.originalname.replace(FileType[img.mimetype], "")} - ${+new Date()}.webp`;
    const quality =
      ((image as unknown as Express.Multer.File)?.size as number) >
      5 * 1024 * 1024
        ? 75
        : 100;
    const compress = await sharp(img.buffer).webp({ quality }).toBuffer();

    await UploadFileToStorage({
      Bucket: environment.STORAGE.BUCKET,
      Key: `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.event}/${filename}`,
      Body: compress,
      ContentType: FileType["image/webp"],
      ACL: "public-read",
    });

    const response = await createEvent({
      name,
      image: filename,
      description,
      isOpen: open,
      endTime: new Date(endTime as Date),
      startTime: new Date(startTime as Date),
    });
    return response;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error) {
      if (image) {
        await RemoveFileFromStorage(
          `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.event}/${filename}`
        );
      }
      return new ErrorApp(MESSAGE_CODE.BAD_REQUEST, 400, error?.message);
    }
  }
};

export const getEventService = async (query: Query) => {
  const { page = "1", perPage = "10" } = query;

  const [acara, totalData] = await Promise.all([
    getEvents(query),
    getEventCount(query),
  ]);

  const data = eventsDTOMapper(acara as Event[]);
  // if (!data.length) {
  //     return new ErrorApp(MESSAGES.ERROR.NOT_FOUND.ACARA, 404, MESSAGE_CODE.NOT_FOUND)

  // }
  const response = {
    data,
    meta: Meta(Number(page), Number(perPage), totalData),
  };
  return response;
};

export const deleteEventService = async (id: string) => {
  const acara = await getEventById(id as string);

  if (!acara) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.ACARA,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  const response = await sofDeleteEvent(id as string);
  return response;
};
export const updateEventService = async ({
  id,
  name,
  image,
  description,
  endTime,
  isOpen,
  startTime,
}: CreateEventBodyRequest) => {
  const matchAcara = await getEventById(id as string);

  if (!matchAcara) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.ACARA,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  const img = image as Express.Multer.File;
  let filename;

  if (image) {
    await RemoveFileFromStorage(
      `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.event}/${filename}`
    );
    filename = `${img?.originalname.replace(FileType[img.mimetype], "")} - ${+new Date()}${FileType[img?.mimetype as string]}`;
    await UploadFileToStorage({
      Bucket: environment.STORAGE.BUCKET,
      Key: `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.event}/${filename}`,
      Body: img?.buffer as Buffer,
      ContentType: img?.mimetype as string,
      ACL: "public-read",
    });
  }

  const updateFields: Partial<EventBodyDTO> = {};

  if (name) updateFields.name = name;
  if (description) updateFields.description = description;
  if (image) updateFields.image = filename;
  if (typeof isOpen !== "undefined")
    updateFields.isOpen = openValue(String(isOpen));

  if (startTime) updateFields.startTime = new Date(startTime as Date);
  if (endTime) updateFields.endTime = new Date(endTime as Date);
  console.log(updateFields);
  const response = await updateEvent(updateFields, id as string);
  return response;
};

export const getDetailEventService = async (id: string) => {
  const acara = await getEventById(id);
  if (!acara) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.ACARA,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  const data = eventDTOMapper(acara as unknown as Event);

  return data;
};
