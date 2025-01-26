import { getCategoryById } from "../lms/categories/categories.repository";
import { MESSAGE_CODE } from "../../utils/error-code";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGES } from "../../utils/messages";
import { getUserById } from "../authentication/auth.repository";
import { CreateClassBodyRequest } from "./classes.dto";

export const createClassValidate = async (
  { categoryId, level, thumbnail }: CreateClassBodyRequest,
  userId: string,
) => {
  if (level !== "BEGINNER" && level !== "INTERMEDIATE" && level !== "EXPERT") {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.LEVEL,
      400,
      MESSAGE_CODE.BAD_REQUEST,
    );
  }

  const getCategory = await getCategoryById(categoryId as string);
  if (!getCategory) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.CATEGORY,
      404,
      MESSAGE_CODE.NOT_FOUND,
    );
  }

  if (!thumbnail) {
    return new ErrorApp(
      MESSAGES.ERROR.REQUIRED.IMAGE,
      400,
      MESSAGE_CODE.BAD_REQUEST,
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
