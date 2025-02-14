import { Query } from "../../../interface/Query";
import { ErrorApp } from "../../../utils/http-error";
import { Meta } from "../../../utils/meta";
import { CreateClassParticipantBodyRequest } from "./class-participants.dto";
import {
  createClassParticipantRepository,
  getClassParticipantByClassIdCountRepository,
  getClassParticipantByClassIdRepository,
} from "./class-participants.repository";
import { createClassParticipantValidate } from "./class-participants.validate";

export const createClassParticipantService = async (
  { classId }: CreateClassParticipantBodyRequest,
  userId: string
) => {
  const validate = await createClassParticipantValidate(
    {
      classId,
    },
    userId
  );

  if (validate instanceof ErrorApp) {
    return validate;
  }

  const classParticipant = await createClassParticipantRepository(
    {
      classId,
    },
    userId
  );

  return classParticipant;
};

export const getClassParticipantsByClassIdService = async (classId: string, query: Query) => {
  const { page = "1", perPage = "10" } = query;
  const [classParticipants, totalData] = await Promise.all([
    getClassParticipantByClassIdRepository(classId, query),
    getClassParticipantByClassIdCountRepository(classId, query),
  ]);

  const meta = Meta(Number(page), Number(perPage), totalData);

  return {
    data: classParticipants,
    meta,
  };
};
