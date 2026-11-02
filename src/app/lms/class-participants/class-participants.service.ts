import { Query } from "../../../interface/Query";
import { ErrorApp } from "../../../utils/http-error";
import { Meta } from "../../../utils/meta";
import { CreateClassParticipantBodyRequest } from "./class-participants.dto";
import { getParticipantsMapper } from "./class-participants.mapper";
import {
  createClassParticipantRepository,
  getClassParticipantByClassIdCountRepository,
  getClassParticipantByClassIdRepository,
} from "./class-participants.repository";
import { createClassParticipantValidate } from "./class-participants.validate";
import { requireClassManage } from "../../../utils/lms-access";
import {
  getClassById,
} from "../classes/classes.repository";
import { getExistingClassParticipantRepository } from "./class-participants.repository";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { MESSAGES } from "../../../utils/messages";

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
  // Direct self-enrol must not bypass the join flow: unpublished
  // classes and paid classes (points/payment gate in
  // userJoinClassService) cannot be joined through this endpoint.
  const cls = await getClassById(classId as string);
  if (cls && cls.status !== "PUBLISH") {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.ONLY_PUBLISH_CLASS,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  if (cls && Number(cls.price)) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.PAID_CLASS_JOIN_FLOW,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  const already = await getExistingClassParticipantRepository(
    classId as string,
    userId
  );
  if (already) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.ALREADY_JOIN_CLASS,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  const classParticipant = await createClassParticipantRepository(
    {
      classId,
    },
    userId
  );

  return classParticipant;
};

export const getClassParticipantsByClassIdService = async (
  classId: string,
  query: Query,
  userId?: string
) => {
  if (userId) {
    const denied = await requireClassManage(userId, classId);
    if (denied) return denied;
  }
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

export const getParticipantsService = async (
  classId: string,
  query: Query,
  userId?: string
) => {
  if (userId) {
    // The LMS participant drawer calls this route with a plain
    // verifyToken; without this check any authenticated user could
    // list names/emails/photos of any class's participants.
    const denied = await requireClassManage(userId, classId);
    if (denied) return denied;
  }
  const participants = await getClassParticipantByClassIdRepository(classId, {
    ...query,
    page: "1",
    perPage: "999999999",
  });
  return getParticipantsMapper(participants);
};
