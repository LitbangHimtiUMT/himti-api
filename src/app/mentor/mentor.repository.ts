import { prisma } from "../../config";
import { Query } from "../../interface/Query";
import { queryPagination } from "../achievements/achievements.repository";

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

export const getMentorsRepository = async (query: Query) => {
  const { search } = query;
  return await prisma.mentor.findMany({
    where: {
      user: {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
    },
    include: {
      user: true,
    },
    ...queryPagination(query),
  });
};

export const getMentorsCountRepository = async (query: Query) => {
  const { search } = query;
  return await prisma.mentor.count({
    where: {
      user: {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
    },
  });
};
