import { environment } from "../../libs";
import { MESSAGE_CODE } from "../../utils/error-code";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGES } from "../../utils/messages";
import {
  BUCKET_FOLDER,
  getFileExtension,
  UploadFileToStorage,
} from "../../utils/upload-file-to-storage";
import { TicketSupportCreation } from "./ticket-support.dao";
import {
  createTicketSupportRepository,
  getTicketSupportToday,
} from "./ticket-support.repository";

export const createTicketSupportService = async (
  reportBy: string,
  data: TicketSupportCreation
) => {
  let fileName = "";
  const ticketToday = await getTicketSupportToday(reportBy);
  if (ticketToday) {
    return new ErrorApp(
      MESSAGES.ERROR.ALREADY.TICKET_SUPPORT_TODAY,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  const mimetype = getFileExtension(data.file.mimetype);
  fileName = `${data.file?.originalname.replace(mimetype, "").replace(" ", "_")}-${+new Date()}${mimetype}`;
  await UploadFileToStorage({
    Bucket: environment.STORAGE.BUCKET,
    Key: `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.ticketSupport}/${fileName}`,
    Body: data.file.buffer,
    ContentType: mimetype,
  });
  return createTicketSupportRepository(reportBy, {
    ...data,
    file: fileName,
  });
};
