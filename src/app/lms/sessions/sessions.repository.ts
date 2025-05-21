import { prisma } from "../../../config";
import { Query } from "../../../interface/Query";
import { queryPagination } from "../../../utils/pagination";
import { type CreateSessionBodyRequest } from "./sessions.dto";

export const getSessionById = async (sessionId: string) => {
  return await prisma.session.findUnique({
    where: {
      id: sessionId,
    },
    select: {
      id: true,
      name: true,
    },
  });
};

export const createSessionRepository = async (
  data: CreateSessionBodyRequest
) => {
  const { name, classId } = data;

  return await prisma.session.create({
    data: {
      name: name as string,
      classId: classId as string,
    },
  });
};

export const getSessionsRepository = async (query: Query, userId: string) => {
  const { classId, search } = query;
  return await prisma.session.findMany({
    where: {
      classId,
      ...(search && {
        name: {
          contains: search,
          mode: "insensitive",
        },
      }),
    },
    include: {
      module: {
        include: {
          assignment: true,
          _count: {
            select: {
              completedModule: {
                where: {
                  userId,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    ...queryPagination(query),
  });
};

export const getSessionsCountRepository = async (query: Query) => {
  const { classId, search } = query;
  return await prisma.session.count({
    where: {
      classId,
      ...(search && {
        name: {
          contains: search,
          mode: "insensitive",
        },
      }),
    },
  });
};

export const getDetailSession = async (sessionId: string) => {
  return await prisma.session.findUnique({
    where: {
      id: sessionId,
    },
    include: {
      class: {
        include: {
          user: true,
        },
      },
    },
  });
};
