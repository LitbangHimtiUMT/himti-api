import { prisma } from "../../../config";
import { type CreateClassParticipantBodyRequest } from "./class-participants.dto";

export const getClassParticipantById = async (participantId: string) => {
  return await prisma.classParticipant.findUnique({
    where: {
      id: participantId,
    },
    select: {
      id: true,
      userId: true,
      classId: true,
    },
  });
};

export const createClassParticipantRepository = async (
  data: CreateClassParticipantBodyRequest,
  userId: string,
) => {
  const { classId } = data;

  return await prisma.classParticipant.create({
    data: {
      userId: userId as string,
      classId: classId as string,
    },
  });
};
