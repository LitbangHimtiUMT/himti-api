import { Level } from "@prisma/client";
import { prisma } from "../../../config";
import { type CreateClassBodyRequest } from "./classes.dto";

export const createClassRepository = async (
  data: CreateClassBodyRequest,
  userId: string,
) => {
  const { name, description, thumbnail, level, categoryId, price } = data;

  return await prisma.class.create({
    data: {
      name: name as string,
      description: description as string,
      thumbnail: thumbnail as string,
      level: level as Level,
      price: price as number,
      categoryId: categoryId as string,
      createdBy: userId,
    },
  });
};
