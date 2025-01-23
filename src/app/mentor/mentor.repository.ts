import { prisma } from "../../config";

export const createMentorRepository = async (userId: string) => {
  return await prisma.mentor.create({
    data: {
      balance: 0,
      userId,
    },
  });
};

export const getMentorByUserIdRepository = async (userId: string) => {
  return await prisma.mentor.findUnique({
    where: {
      userId,
    },
  });
};