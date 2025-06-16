import { prisma } from "../../../config";
import { Query } from "../../../interface/Query";
import { queryPagination } from "../../../utils/pagination";
import { type CreateModuleBodyRequest } from "./modules.dto";

export const getModuleById = async (
  moduleId: string,
  userId?: string,
  isMentor?: boolean
) => {
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
      completedModule: {
        where: {
          ...(userId && {
            userId,
          }),
        },
        select: {
          id: true,
          userId: true,
        },
      },
      assignment: {
        select: {
          type: true,
          id: true,
          title: true,
          isFinalAssigment: true,
          dueDate: true,
          createdAt: true,
          description: true,
          submission: {
            where: {
              ...(userId &&
                !isMentor && {
                  userId,
                }),
            },
            select: {
              id: true,
              feedback: true,
              file: true,
              createdAt: true,
              status: true,
              participant: { select: { id: true, name: true } },
            },
          },
        },
      },
      session: {
        select: {
          name: true,
          class: {
            select: {
              name: true,
              id: true,
              createdBy: true,
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
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
    include: {
      session: {
        include: {
          class: true,
        },
      },
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

export const getModulesByClass = async (classId: string) => {
  return prisma.module.findMany({
    where: {
      session: {
        classId,
      },
    },
    include: {
      assignment: {
        include: {
          submission: true,
        }
      }
    }
  });
};

export const deleteModuleRepository = async(moduleId: string) => {
  return prisma.module.delete({
    where: {
      id: moduleId,
    },
  });
}
