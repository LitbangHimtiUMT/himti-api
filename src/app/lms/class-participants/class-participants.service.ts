import { ErrorApp } from "../../../utils/http-error";
import { CreateClassParticipantBodyRequest } from "./class-participants.dto";
import { createClassParticipantRepository } from "./class-participants.repository";
import { createClassParticipantValidate } from "./class-participants.validate";

export const createClassParticipantService = async (
  { classId }: CreateClassParticipantBodyRequest,
  userId: string,
) => {
  const validate = await createClassParticipantValidate(
    {
      classId,
    },
    userId,
  );

  if (validate instanceof ErrorApp) {
    return validate;
  }

  const classParticipant = await createClassParticipantRepository(
    {
      classId,
    },
    userId,
  );

  return classParticipant;
};
