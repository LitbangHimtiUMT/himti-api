import { prisma } from "../../config";
import { SubAcaraBodyDTO, SubAcaraQuery } from "./sub-acara.dto";

export const getSubAcaraList = async (query: SubAcaraQuery) => {
  const { page = "1", perPage = "10", eventId, search } = query;
  return await prisma.subAcara.findMany({
    where: {
      ...(eventId && { eventId }),
      ...(search && {
        name: { contains: search, mode: "insensitive" },
      }),
    },
    orderBy: { startTime: "asc" },
    take: Number(perPage),
    skip: (Number(page) - 1) * Number(perPage),
  });
};

export const getSubAcaraCount = async (query: SubAcaraQuery) => {
  const { eventId, search } = query;
  return await prisma.subAcara.count({
    where: {
      ...(eventId && { eventId }),
      ...(search && {
        name: { contains: search, mode: "insensitive" },
      }),
    },
  });
};

export const getSubAcaraById = async (id: string) => {
  return await prisma.subAcara.findUnique({ where: { id } });
};

export const createSubAcara = async (data: SubAcaraBodyDTO) => {
  return await prisma.subAcara.create({
    data: {
      name: data.name as string,
      description: data.description,
      image: data.image as string | undefined,
      startTime: new Date(data.startTime as string),
      endTime: new Date(data.endTime as string),
      isOpenAbsen: (data.isOpenAbsen as boolean) ?? false,
      eventId: data.eventId as string,
    },
  });
};

export const updateSubAcara = async (id: string, data: SubAcaraBodyDTO) => {
  return await prisma.subAcara.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && {
        description: data.description,
      }),
      ...(data.image && { image: data.image as string }),
      ...(data.startTime && { startTime: new Date(data.startTime as string) }),
      ...(data.endTime && { endTime: new Date(data.endTime as string) }),
      ...(data.isOpenAbsen !== undefined && {
        isOpenAbsen: data.isOpenAbsen as boolean,
      }),
      ...(data.eventId && { eventId: data.eventId }),
    },
  });
};

export const deleteSubAcara = async (id: string) => {
  return await prisma.subAcara.delete({ where: { id } });
};
