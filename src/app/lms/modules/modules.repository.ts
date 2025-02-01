import { prisma } from "../../../config";
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
      name: name as string,
      sessionId: sessionId as string,
      textModule: textModule as string,
      videoUrl: videoUrl as string,
      fileModule: fileModule as string,
    },
  });
};
