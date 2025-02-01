import { getSessionById } from "../sessions/sessions.repository";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { ErrorApp } from "../../../utils/http-error";
import { MESSAGES } from "../../../utils/messages";
import { CreateModuleBodyRequest } from "./modules.dto";

export const createModuleValidate = async ({
  sessionId,
}: CreateModuleBodyRequest) => {
  const getSession = await getSessionById(sessionId as string);
  if (!getSession) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.SESSION,
      404,
      MESSAGE_CODE.NOT_FOUND,
    );
  }
};
