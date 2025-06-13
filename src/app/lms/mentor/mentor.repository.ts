import { prisma } from "../../../config";
import { queryPagination } from "../../../utils/pagination";
import { CreateMentorDAO } from "./mentor.dao";
import { QueryMentor } from "./mentor.interface";

export const createMentorRepository = async (
  userId: string,
  data?: CreateMentorDAO
) => {
  return await prisma.mentor.create({
    data: {
      balance: 0,
      userId,
      facebook: data?.facebook,
      instagram: data?.instagram,
      linkedin: data?.linkedin,
      twitter: data?.twitter,
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

export const getMentorsRepository = async (
  query: QueryMentor,
  userId?: string
) => {
  const { search, classId } = query;
  return await prisma.mentor.findMany({
    where: {
      user: {
        ...(search && {
          name: {
            contains: search,
            mode: "insensitive",
          },
        }),
      },
      NOT: [
        ...(userId ? [{ userId }] : []),
        ...(classId
          ? [
              {
                user: {
                  ClassMentor: {
                    some: {
                      classId,
                    },
                  },
                },
              },
            ]
          : []),
      ],
    },
    include: {
      user: true,
    },
    ...queryPagination(query),
  });
};

export const getMentorsCountRepository = async (
  query: QueryMentor,
  userId?: string
) => {
  const { search, classId } = query;
  return await prisma.mentor.count({
    where: {
      user: {
        ...(search && {
          name: {
            contains: search,
            mode: "insensitive",
          },
        }),
      },
      NOT: [
        ...(userId ? [{ userId }] : []),
        ...(classId
          ? [
              {
                user: {
                  ClassMentor: {
                    some: {
                      classId,
                    },
                  },
                },
              },
            ]
          : []),
      ],
    },
  });
};

export const getMentorByIdRepository = async (mentorId: string) => {
  return await prisma.mentor.findUnique({
    where: {
      id: mentorId,
    },
    include: {
      user: true,
    },
  });
};

export const deleteMentorRepository = async (mentorId: string) => {
  return await prisma.mentor.delete({
    where: {
      id: mentorId,
    },
  });
};
