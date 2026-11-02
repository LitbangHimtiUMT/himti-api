import { prisma } from "../../config";

export interface CreatePotentialUserKeyDTO {
  key: string;
  maxUsage?: number;
  allowedGen?: string[];
  expiredAt?: Date;
}

export const createKey = async (data: CreatePotentialUserKeyDTO) => {
  return await prisma.potentialUserKey.create({
    data: {
      key: data.key,
      maxUsage: data.maxUsage,
      allowedGen: data.allowedGen || [],
      expiredAt: data.expiredAt ? new Date(data.expiredAt) : null,
    },
  });
};

export const findKeyByString = async (key: string) => {
  return await prisma.potentialUserKey.findUnique({
    where: { key },
  });
};

export const incrementKeyUsage = async (key: string) => {
  return await prisma.potentialUserKey.update({
    where: { key },
    data: {
      usedCount: {
        increment: 1,
      },
    },
  });
};

export const findAllKeys = async () => {
  return await prisma.potentialUserKey.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const deleteKeyById = async (id: string) => {
  return await prisma.potentialUserKey.delete({
    where: { id },
  });
};
