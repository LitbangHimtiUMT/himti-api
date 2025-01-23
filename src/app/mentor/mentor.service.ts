import { MESSAGE_CODE } from "../../utils/error-code";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGES } from "../../utils/messages";
import { getUserById } from "../authentication/auth.repository";
import {
  createMentorRepository,
  getMentorByUserIdRepository,
} from "./mentor.repository";

export const createMentorService = async (userId: string) => {
  const user = await getUserById(userId);
  if (!user) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.USER.ACCOUNT,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  const existingMentor = await getMentorByUserIdRepository(userId);
  if (existingMentor) {
    return new ErrorApp(
      MESSAGES.ERROR.ALREADY.USER_MENTOR,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  const mentor = await createMentorRepository(user.id);

  return mentor;
};
