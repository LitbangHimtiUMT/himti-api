import { MESSAGE_CODE } from "../../../utils/error-code";
import { ErrorApp } from "../../../utils/http-error";
import { MESSAGES } from "../../../utils/messages";
import { getSessionById } from "../sessions/sessions.repository";

export const createModuleValidate = async (sessionId: string) => {
  const session = await getSessionById(sessionId);
  if (!session) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.SESSION,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  return session
};
