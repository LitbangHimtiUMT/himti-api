import { getModuleById } from "../modules/modules.repository";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { ErrorApp } from "../../../utils/http-error";
import { MESSAGES } from "../../../utils/messages";
import { getUserById } from "../../authentication/auth.repository";
import { CreateCompletedModuleBodyRequest } from "./completed-modules.dto";

export const createCompletedModuleValidate = async ({
  moduleId,
  userId,
}: CreateCompletedModuleBodyRequest) => {
  const getModuleId = await getModuleById(moduleId as string);
  if (!getModuleId) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.MODULE,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  const getUser = await getUserById(userId as string);
  if (!getUser) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.USER.ACCOUNT,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
};
