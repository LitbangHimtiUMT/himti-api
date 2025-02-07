import { prisma } from "../../../config";
import { Query } from "../../../interface/Query";
import { queryPagination } from "../../achievements/achievements.repository";
import { type CreateModuleBodyRequest } from "./modules.dto";

export const getModuleById = async (moduleId: string) => {
  return await prisma.module.findUnique({
    where: {
      id: moduleId,
    },
    select: {
      id: true,
      name: true,
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
  const { sessionId } = query;
  return await prisma.module.findMany({
    where: {
      sessionId,
    },
    ...queryPagination(query),
  });
};

export const getModulesCountRepository = async (query: Query) => {
  const { sessionId } = query;
  return await prisma.module.count({
    where: {
      sessionId,
    },
  });
};
