import { prisma } from "../../../config";
import { type CreateCompletedModuleBodyRequest } from "./completed-modules.dto";

export const getCompletedModuleByIdAndUserId = async (moduleId: string) => {
  return await prisma.completedModule.findUnique({
    where: {
      id: moduleId,
    },
    select: {
      id: true,
      userId: true,
      moduleId: true,
    },
  });
};

export const getAlreadyCompletedModule = async (
  moduleId: string,
  userId: string,
) => {
  return await prisma.completedModule.findFirst({
    where: {
      moduleId: moduleId,
      userId: userId,
    },
  });
};

export const createCompletedModuleRepository = async (
  data: CreateCompletedModuleBodyRequest,
) => {
  const { moduleId,userId } = data;

  return await prisma.completedModule.create({
    data: {
      userId: userId as string,
      moduleId: moduleId as string,
    },
  });
};
