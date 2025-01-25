import { prisma } from "../../../config";
import { CreateCategoryDAO } from "./categories.dao";

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
      },
    },
  });
};
