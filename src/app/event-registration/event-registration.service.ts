import sharp from "sharp";
import { MESSAGE_CODE } from "../../utils/error-code";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGES } from "../../utils/messages";
import {
  BUCKET_FOLDER,
  FileType,
  UploadFileToStorage,
} from "../../utils/upload-file-to-storage";
import { getUserById } from "../authentication/auth.repository";
import { getEventById } from "../event/event.repository";
import { EventRegistrationCreationDTO } from "./event-registration.dto";
import { environment } from "../../libs";
import { EventType } from "@prisma/client";

export const createEventRegistrationService = async (
  data: EventRegistrationCreationDTO
) => {
  let filename: string = "";
  const event = await getEventById(data.eventId);
  if (!event) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.ACARA,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  if (event.type === EventType.COMMON) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.COMMONT_EVENT,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  const user = await getUserById(data.userId);
  if (!user) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.USER.ACCOUNT,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  if (data.image) {
    const img = data.image;
    filename =
      `${img?.originalname.replace(FileType[img.mimetype], "")}-${+new Date()}.webp`.replace(
        " ",
        ""
      );
    const quality = (data.image?.size as number) > 5 * 1024 * 1024 ? 75 : 100;
    const compress = await sharp(img.buffer).webp({ quality }).toBuffer();

    await UploadFileToStorage({
      Bucket: environment.STORAGE.BUCKET,
      Key: `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.eventRegistration}/${filename}`,
      Body: compress,
      ContentType: FileType["image/webp"],
      ACL: "public-read",
    });
  }
};
