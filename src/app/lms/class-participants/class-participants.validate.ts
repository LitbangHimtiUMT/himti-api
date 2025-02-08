import { getClassById } from "../classes/classes.repository";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { ErrorApp } from "../../../utils/http-error";
import { MESSAGES } from "../../../utils/messages";
import { getUserById } from "../../authentication/auth.repository";
import { CreateClassParticipantBodyRequest } from "./class-participants.dto";

export const createClassParticipantValidate = async (
  { classId }: CreateClassParticipantBodyRequest,
  userId: string,
) => {
  const getClass = await getClassById(classId as string);
  if (!getClass) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.CLASS,
      404,
      MESSAGE_CODE.NOT_FOUND,
    );
  }

  const getUser = await getUserById(userId as string);
  if (!getUser) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.USER.ACCOUNT,
      404,
      MESSAGE_CODE.NOT_FOUND,
    );
  }
};
