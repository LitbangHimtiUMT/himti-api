import { prisma } from "../../../config";
import { type CreateSessionBodyRequest } from "./sessions.dto";

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
