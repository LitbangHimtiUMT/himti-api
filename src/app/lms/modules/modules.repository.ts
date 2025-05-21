import { prisma } from "../../../config";
import { Query } from "../../../interface/Query";
import { queryPagination } from "../../../utils/pagination";
import { type CreateModuleBodyRequest } from "./modules.dto";

export const getModuleById = async (moduleId: string) => {
  return await prisma.module.findUnique({
    where: {
      id: moduleId,
    },
    select: {
      id: true,
      name: true,
      fileModule: true,
      textModule: true,
      videoUrl: true,
      assignment: {
        select: {
          id: true,
          title: true,
          isFinalAssigment: true,
          dueDate: true,
          createdAt: true,
          description: true,
        },
      },
      session: {
        select: {
          class: {
            select: {
              createdBy: true,
              user: {
                select: {
                  id: true,
                  name: true,
                }
              }
            },
          },
        },
      },
    },
  });
};

export const createModuleRepository = async (
  data: Omit<CreateModuleBodyRequest, "fileModule"> & { fileModule?: string }
) => {
  const { name, sessionId, textModule, videoUrl, fileModule } = data;

  return await prisma.module.create({
    data: {
      name,
      sessionId,
      textModule,
      videoUrl,
      fileModule,
    },
  });
};

export const getModulesRepository = async (query: Query, userId: string) => {
  const { sessionId, search } = query;
  return await prisma.module.findMany({
    where: {
      sessionId,
      ...(search && {
        name: {
          contains: search,
          mode: "insensitive",
        },
      }),
    },
    include: {
      assignment: true,
      completedModule: {
        where: {
          userId,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    ...queryPagination(query),
  });
};

export const getModulesCountRepository = async (query: Query) => {
  const { sessionId, search } = query;
  return await prisma.module.count({
    where: {
      sessionId,
      name: {
        contains: search,
        mode: "insensitive",
      },
    },
  });
};
