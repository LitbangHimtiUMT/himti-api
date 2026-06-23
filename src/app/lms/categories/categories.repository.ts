import { prisma } from "../../../config";
import { Query } from "../../../interface/Query";
import { queryPagination } from "../../../utils/pagination";
import { CreateCategoryDAO, UpdateCategoryDAO } from "./categories.dao";

export const getCategoryById = async (CategoryId: string) => {
  return await prisma.category.findUnique({
    where: {
      id: CategoryId,
    },
    select: {
      id: true,
      name: true,
      _count: true,
    },
  });
};

export const updateCategoryRepository = async (
  categoryId: string,
  data: UpdateCategoryDAO
) => {
  return await prisma.category.update({
    where: {
      id: categoryId,
    },
    data: {
      name: data.name,
    },
  });
};

export const deleteCategoryRepository = async (categoryId: string) => {
  return await prisma.category.delete({
    where: {
      id: categoryId,
    },
  });
};

export const getCategoryNameExcludeIdRepository = async (
  name: string,
  excludeId: string
) => {
  return await prisma.category.findFirst({
    where: {
      name: {
        equals: name,
        mode: "insensitive",
      },
      NOT: {
        id: excludeId,
      },
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
