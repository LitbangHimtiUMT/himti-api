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
      session: {
        select: {
          class: {
            select: {
              createdBy: true,
            },
          },
        },
      },
    },
  });
};

export const createModuleRepository = async (data: CreateModuleBodyRequest) => {
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

export const getModulesRepository = async (query: Query) => {
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
