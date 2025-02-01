import { prisma } from "../../../config";
import { type CreateSessionBodyRequest } from "./sessions.dto";

export const getSessionById = async (sessionId: string) => {
  return await prisma.session.findUnique({
    where: {
      id: sessionId,
    },
    select: {
      id: true,
      name: true,
    },
  });
};

export const createSessionRepository = async (
  data: CreateSessionBodyRequest,
) => {
  const { name, classId } = data;

  return await prisma.session.create({
    data: {
      name: name as string,
      classId: classId as string,
    },
  });
};
