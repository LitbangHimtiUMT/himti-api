import { ClassStatus, Level } from "@prisma/client";
import { prisma } from "../../../config";
import { type CreateClassBodyRequest } from "./classes.dto";
import { Query } from "../../../interface/Query";
import { queryPagination } from "../../../utils/pagination";
import { stringToBool } from "../../../utils/string-to-bool";

export const getClassById = async (classId: string, userId?: string) => {
  return await prisma.class.findUnique({
    where: {
      id: classId,
    },
    include: {
      user: true,
      category: true,
      session: {
        include: {
          module: {
            include: {
              _count: {
                select: {
                  completedModule: {
                    where: {
                      userId,
                    },
                  },
                },
              },
              completedModule: {
                where: {
                  userId,
                },
              },
            },
          },
        },
      },
      _count: {
        select: { classParticipant: true },
      },
    },
  });
};

export const createClassRepository = async (
  data: CreateClassBodyRequest & { code: string },
  userId: string
) => {
  const { name, description, thumbnail, level, categoryId, price } = data;
  return await prisma.class.create({
    data: {
      name,
      description,
      thumbnail: thumbnail as string,
      level: level as Level,
      price: Number(price),
      categoryId: categoryId as string,
      createdBy: userId,
      status: "DRAFT",
      code: data.code,
    },
  });
};

export const getClassRepository = async (
  query: Query & { ignoreUser?: string },
  userId?: string
) => {
  const { search, categoryId, orderBy, ignoreUser } = query;
  const ignoreUserBool = stringToBool(ignoreUser);
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
      ...(userId &&
        !ignoreUserBool && {
          createdBy: userId,
        }),
      status: userId ? undefined : "PUBLISH",
    },
    include: {
      user: true,
      category: true,
      _count: {
        select: {
          classParticipant: true,
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
  query: Query & {
    ignoreUser?: string;
  },
  userId?: string
) => {
  const { search, categoryId, ignoreUser } = query;
  const ignoreUserBool = stringToBool(ignoreUser);

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
      ...(userId &&
        !ignoreUserBool && {
          createdBy: userId,
        }),
      status: userId ? undefined : "PUBLISH",
    },
  });
};

export const getClassByCode = async (code: string) => {
  return await prisma.class.findUnique({
    where: {
      code,
    },
    include: {
      user: true,
      category: true,
      _count: {
        select: { classParticipant: true },
      },
    },
  });
};

export const updateStatusClass = async (
  classId: string,
  status: ClassStatus
) => {
  return await prisma.class.update({
    where: {
      id: classId,
    },
    data: {
      status,
    },
  });
};
