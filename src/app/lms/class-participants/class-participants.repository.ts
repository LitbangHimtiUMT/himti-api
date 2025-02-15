import { prisma } from "../../../config";
import { Query } from "../../../interface/Query";
import { queryPagination } from "../../../utils/pagination";
import { type CreateClassParticipantBodyRequest } from "./class-participants.dto";

export const getClassParticipantById = async (participantId: string) => {
  return await prisma.classParticipant.findUnique({
    where: {
      id: participantId,
    },
    select: {
      id: true,
      userId: true,
      classId: true,
    },
  });
};

export const createClassParticipantRepository = async (
  data: CreateClassParticipantBodyRequest,
  userId: string
) => {
  const { classId } = data;

  return await prisma.classParticipant.create({
    data: {
      userId: userId as string,
      classId: classId as string,
    },
  });
};

export const getClassParticipantByUserIdRepository = async (
  userId: string,
  query: Query
) => {
  const { search } = query;
  return await prisma.classParticipant.findMany({
    where: {
      userId,
      ...(search && {
        class: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      }),
    },
    include: {
      class: {
        include: {
          completedClass: true,
        },
      },
    },
    ...queryPagination(query),
  });
};

export const getClassParticipantByUserIdCountRepository = async (
  userId: string,
  query: Query
) => {
  const { search } = query;
  return await prisma.classParticipant.count({
    where: {
      userId,
      ...(search && {
        class: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      }),
    },
  });
};

export const getClassParticipantByClassIdRepository = async (
  classId: string,
  query: Query
) => {
  const { search, orderBy } = query;
  return await prisma.classParticipant.findMany({
    where: {
      classId,
      ...(search && {
        OR: [
          {
            user: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
          {
            class: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        ],
      }),
    },
    ...(orderBy && {
      orderBy: {
        createdAt: orderBy,
      },
    }),
    include: {
      user: true,
    },
    ...queryPagination(query),
  });
};

export const getClassParticipantByClassIdCountRepository = async (
  classId: string,
  query: Query
) => {
  const { search } = query;
  return await prisma.classParticipant.count({
    where: {
      classId,
      ...(search && {
        OR: [
          {
            user: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
          {
            class: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        ],
      }),
    },
  });
};

export const getExistingClassParticipantRepository = async (
  classId: string,
  userId: string
) => {
  return await prisma.classParticipant.findFirst({
    where: {
      classId,
      userId,
    },
  });
};
