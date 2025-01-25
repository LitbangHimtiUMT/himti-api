import { prisma } from "../../config";
import { Query } from "../../interface/Query";
import { queryPagination } from "../achievements/achievements.repository";

export const createUserFCM = async (userId: string, fcmToken: string) => {
  return await prisma.userFCM.create({
    data: {
      userId,
      fcmToken,
    },
  });
};

export const deleteUserFCM = async (id: string) => {
  return await prisma.userFCM.delete({
    where: {
      id,
    },
  });
};

export const deleteManyUserFCM = async (userId: string) => {
  return await prisma.userFCM.deleteMany({
    where: {
      userId,
    },
  });
};

export const getFCMUserById = async (fcmId: string) => {
  return await prisma.userFCM.findUnique({
    where: {
      id: fcmId,
    },
  });
};

export const getUserFCMByUserId = async (userId: string) => {
  return await prisma.userFCM.findFirst({
    where: {
      userId,
    },
  });
};

export const getAllFCMUser = async (query: Query) => {
  const { search } = query;
  return await prisma.userFCM.findMany({
    where: {
      User: {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
    },
    include: {
      User: true,
    },
    ...queryPagination(query),
  });
};

export const getAllMemberFCMUser = async (query: Query) => {
  return await prisma.userFCM.findMany({
    where: {
      User: {
        memberId: {
          not: null,
        },
        role: "ANGGOTA",
      },
    },
    include: {
      User: true,
    },
    ...queryPagination(query),
  });
};

export const getAllFCMUserCount = async (query: Query) => {
  const { search } = query;

  return await prisma.userFCM.count({
    where: {
      User: {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
    },
  });
};

export const getUserFCMByNIM = (nim: string) => {
  return prisma.userFCM.findMany({
    where: {
      User: {
        nim,
      },
    },
  });
};
