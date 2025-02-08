import { prisma } from "../../config";
import { Query } from "../../interface/Query";
import { queryPagination } from "../../utils/pagination";

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
