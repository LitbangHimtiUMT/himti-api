import { getClassById } from "../classes/classes.repository";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { ErrorApp } from "../../../utils/http-error";
import { MESSAGES } from "../../../utils/messages";
import { CreateSessionBodyRequest } from "./sessions.dto";

export const createSessionValidate = async ({
  classId,
}: CreateSessionBodyRequest) => {
  const getClass = await getClassById(classId as string);
  if (!getClass) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.CLASS,
      404,
      MESSAGE_CODE.NOT_FOUND,
    );
  }
};
