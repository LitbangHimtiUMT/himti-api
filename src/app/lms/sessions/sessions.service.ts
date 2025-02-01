import { ErrorApp } from "../../../utils/http-error";
import { CreateSessionBodyRequest } from "./sessions.dto";
import { createSessionRepository } from "./sessions.repository";
import { createSessionValidate } from "./sessions.validate";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { MESSAGES } from "../../../utils/messages";

export const createSessionService = async ({
  name,
  classId,
}: CreateSessionBodyRequest) => {
  try {
    const validate = await createSessionValidate({
      classId,
    });

    if (validate instanceof ErrorApp) {
      return validate;
    }

    const session = await createSessionRepository({
      name,
      classId,
    });

    return session;
  } catch (error) {
    throw new ErrorApp(
      MESSAGES.ERROR.SERVER_ERROR.INTERNAL_SERVER_ERROR,
      500,
      MESSAGE_CODE.INTERNAL_SERVER_ERROR,
    );
  }
};
