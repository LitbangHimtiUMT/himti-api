import { HistoryModule } from "@prisma/client";
import { Query } from "../../../interface/Query";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { ErrorApp } from "../../../utils/http-error";
import { MESSAGES } from "../../../utils/messages";
import { historyCreateFlag } from "../../history/history.repository";
import { getClassById } from "../classes/classes.repository";
import { getMentorByIdRepository } from "../mentor/mentor.repository";
import { InviteMentorDTO } from "./class-mentor.dto";
import {
  createClassMentorRepository,
  getClassMentorRepository,
  getMentorByClassRepository,
} from "./class-mentor.repository";
import { getClassMentorMapper } from "./class-mentor.mapper";
import { getUserById } from "../../authentication/auth.repository";
import { sendMailInvitationMentor } from "./class-mentor.utility";

export const inviteMentorService = async (
  createdBy: string,
  data: InviteMentorDTO
) => {
  const classess = await getClassById(data.classId);
  if (!classess) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.CLASS,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  const mentor = await getMentorByIdRepository(data.mentorId);
  if (!mentor) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.MENTOR,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  if (mentor.userId === createdBy) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.SELF_INVITED,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  const exist = await getClassMentorRepository(classess.id, mentor.userId);
  if (exist) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.ALREADY_INVITED,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  const inviter = await getUserById(createdBy);
  if (!inviter) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.USER.ACCOUNT,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  const result = await createClassMentorRepository(classess.id, mentor.userId);
  await Promise.all([
    historyCreateFlag({
      module: HistoryModule.CLASS,
      title: `Invite ${mentor.user?.name} to class ${classess.name}`,
      actionId: result.id,
      createdBy,
    }),
    ...(mentor?.user?.email
      ? [
          sendMailInvitationMentor(mentor.user?.email, {
            className: classess.name,
            inviter: inviter.name,
            recipient: mentor.user?.name,
          }),
        ]
      : []),
  ]);
  return result;
};

export const getClassMentorService = async (classId: string, query: Query) => {
  const classMentor = await getMentorByClassRepository(classId, query);

  return getClassMentorMapper(classMentor);
};
