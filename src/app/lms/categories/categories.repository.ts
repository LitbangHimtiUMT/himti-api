import { prisma } from "../../../config";
import { Query } from "../../../interface/Query";
import { queryPagination } from "../../achievements/achievements.repository";
import { CreateCategoryDAO } from "./categories.dao";

export const getCategoryById = async (CategoryId: string) => {
  return await prisma.category.findUnique({
    where: {
      id: CategoryId,
    },
    select: {
      id: true,
      name: true,
    },
  });
};

export const createCategoryRepository = async (data: CreateCategoryDAO) => {
  return await prisma.category.create({
    data: {
      name: data.name,
    },
  });
};

export const getCategoryNameRepository = async (name: string) => {
  return await prisma.category.findFirst({
    where: {
      name: {
        contains: name,
        mode: "insensitive",
      },
    },
  });
};

export const getCategoriesRepository = async (query: Query) => {
  const { search } = query;
  return await prisma.category.findMany({
    where: {
      name: {
        contains: search,
        mode: "insensitive",
      },
    },
    include: {
      _count: true,
    },
    ...queryPagination(query),
  });
};

export const getCategoriesCountRepository = async (query: Query) => {
  const { search } = query;
  return await prisma.category.count({
    where: {
      name: {
        contains: search,
        mode: "insensitive",
      },
    },
  });
};
