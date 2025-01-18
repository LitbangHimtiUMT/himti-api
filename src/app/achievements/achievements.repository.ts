import { prisma } from "../../config";
import { Query } from "../../interface/Query";

export const queryPagination = (query: Query) => {
  const { page = "1", perPage = "10" } = query;
  return {
    take: Number(perPage),
    skip: (Number(page) - 1) * Number(perPage),
  };
};

export const querySearch = (query: Query) => {
  const { search } = query;
  return {
    title: {
      contains: search,
      mode: "insensitive",
    },
  };
};

export const getPrestasi = async (query: Query) => {
  const { search } = query;
  return await prisma.achievement.findMany({
    where: {
      title: {
        contains: search,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      image: true,
      title: true,
    },
    ...queryPagination(query),
  });
};
export const getPrestasiCount = async (query: Query) => {
  const { search } = query;
  return await prisma.achievement.count({
    where: {
      title: {
        contains: search,
        mode: "insensitive",
      },
    },
  });
};
