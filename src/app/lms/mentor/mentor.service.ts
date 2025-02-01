import { Query } from "../../../interface/Query";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { ErrorApp } from "../../../utils/http-error";
import { MESSAGES } from "../../../utils/messages";
import { Meta } from "../../../utils/meta";
import { getUserById } from "../../authentication/auth.repository";
import { getMentorTransactionsByMentorIdRepository } from "../mentor-transactions/mentor-transactions.repository";
import { CreateMentorDAO } from "./mentor.dao";
import { getDetailMentorDTOMapper, getMentorsDTOMapper } from "./mentor.mapper";
import {
  createMentorRepository,
  deleteMentorRepository,
  getMentorByIdRepository,
  getMentorByUserIdRepository,
  getMentorsCountRepository,
  getMentorsRepository,
} from "./mentor.repository";

export const createMentorService = async (
  userId: string,
  data?: CreateMentorDAO
) => {
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
  const mentor = await createMentorRepository(user.id, data);

  return mentor;
};

export const getMentorsService = async (query: Query) => {
  const { page = "1", perPage = "10" } = query;
  const [mentors, totalData] = await Promise.all([
    getMentorsRepository(query),
    getMentorsCountRepository(query),
  ]);

  const meta = Meta(Number(page), Number(perPage), totalData);
  const data = getMentorsDTOMapper(mentors);

  return {
    data,
    meta,
  };
};

export const deleteMentorService = async (mentorId: string) => {
  const mentor = await getMentorByIdRepository(mentorId);
  if (!mentor) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.MENTOR,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  return await deleteMentorRepository(mentorId);
};

export const getMentorByIdService = async (mentorId: string) => {
  const mentor = await getMentorByIdRepository(mentorId);
  if (!mentor) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.MENTOR,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  const mentorTransactions = await getMentorTransactionsByMentorIdRepository(
    mentor.id
  );

  return getDetailMentorDTOMapper(mentor, mentorTransactions);
};
