import { prisma } from "../../../config";
import { Query } from "../../../interface/Query";

export const createClassMentorRepository = async (
  classId: string,
  userId: string
) => {
  return prisma.classMentor.create({
    data: {
      classId,
      userId,
    },
  });
};

export const getClassMentorRepository = async (
  classId: string,
  userId: string
) => {
  return prisma.classMentor.findFirst({
    where: {
      classId,
      userId,
    },
  });
};

export const getMentorByClassRepository = async (classId: string, query: Query) => {
  const {search} = query
  return prisma.classMentor.findMany({
    where: {
      classId,
      ...(search && {
       OR: [
        {
          user: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
        }
       ]
      }),
    },
    include: {
      user: true,
    }
  });
};
