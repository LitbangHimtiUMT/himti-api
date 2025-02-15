import { getClassById } from "../classes/classes.repository";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { ErrorApp } from "../../../utils/http-error";
import { MESSAGES } from "../../../utils/messages";
import { getUserById } from "../../authentication/auth.repository";
import { CreateCompletedClassBodyRequest } from "./completed-classes.dto";

export const createCompletedClassValidate = async (
  { classId }: CreateCompletedClassBodyRequest,
  userId: string,
) => {
  const getClassId = await getClassById(classId as string);
  if (!getClassId) {
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
