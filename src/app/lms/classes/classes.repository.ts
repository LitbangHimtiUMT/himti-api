import { Level } from "@prisma/client";
import { prisma } from "../../../config";
import { type CreateClassBodyRequest } from "./classes.dto";
import { Query } from "../../../interface/Query";
import { queryPagination } from "../../../utils/pagination";

export const getClassById = async (classId: string) => {
  return await prisma.class.findUnique({
    where: {
      id: classId,
    },
    select: {
      id: true,
      name: true,
    },
  });
};

export const createClassRepository = async (
  data: CreateClassBodyRequest,
  userId: string
) => {
  const { name, description, thumbnail, level, categoryId, price } = data;
  return await prisma.class.create({
    data: {
      name: name as string,
      description: description as string,
      thumbnail: thumbnail as string,
      level: level as Level,
      price: Number(price),
      categoryId: categoryId as string,
      createdBy: userId,
      status: "DRAFT",
    },
  });
};

export const getClassRepository = async (query: Query, userId?: string) => {
  const { search, categoryId, orderBy } = query;
  return await prisma.class.findMany({
    where: {
      ...(search && {
        name: {
          contains: search,
          mode: "insensitive",
        },
      }),
      ...(categoryId && {
        categoryId,
      }),
      ...(userId && {
        createdBy: userId,
      }),
      status: "PUBLISH",
    },
    include: {
      user: true,
      category: true,
      classParticipant: {
        select: {
          id: true,
          userId: true,
        },
      },
    },
    ...(orderBy && {
      orderBy: {
        classParticipant: {
          _count: orderBy,
        },
      },
    }),
    ...queryPagination(query),
  });
};

export const getClassCountRepository = async (
  query: Query,
  userId?: string
) => {
  const { search, categoryId } = query;
  return await prisma.class.count({
    where: {
      ...(search && {
        name: {
          contains: search,
          mode: "insensitive",
        },
      }),
      ...(categoryId && {
        categoryId,
      }),
      ...(userId && {
        createdBy: userId,
      }),
      status: "PUBLISH",
    },
  });
};
