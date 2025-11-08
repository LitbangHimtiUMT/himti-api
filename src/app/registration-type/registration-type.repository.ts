import { prisma } from "../../config";
import { queryPagination } from "../../utils/pagination";
import {
  RegistrationTypeCreationDTO,
  RegistrationTypeQuery,
} from "./registration-type.interface";

export const createRegistrationTypeRepository = async (
  data: RegistrationTypeCreationDTO
) => {
  return await prisma.registrationType.create({
    data: {
      name: data.name,
      type: data.type,
      year: data.year,
      isActive: typeof data.isActive === "boolean" ? data.isActive : true,
      eventId: data.eventId,
    },
  });
};

export const getRegistrationTypesRepository = async (
  query: RegistrationTypeQuery = {}
) => {
  const { type, isActive, eventId, search } = query;
  return prisma.registrationType.findMany({
    where: {
      ...(search && { name: { contains: search, mode: "insensitive" } }),
      ...(type && { type }),
      ...(typeof isActive === "boolean" && { isActive }),
      ...(eventId && { eventId }),
    },
    ...queryPagination(query),
  });
};

export const getRegistrationTypesCountRepository = async (
  query: RegistrationTypeQuery = {}
) => {
  const { type, isActive, eventId, search } = query;
  return prisma.registrationType.count({
    where: {
      ...(search && { name: { contains: search, mode: "insensitive" } }),
      ...(type && { type }),
      ...(typeof isActive === "boolean" && { isActive }),
      ...(eventId && { eventId }),
    },
  });
};

export const getRegistrationTypeByIdRepository = async (id: string) => {
  return await prisma.registrationType.findUnique({
    where: { id },
  });
};

export const getRegistrationTypesByIdsRepository = async (ids: string[]) => {
  if (!ids.length) {
    return [];
  }
  return await prisma.registrationType.findMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
};

export const updateRegistrationTypeRepository = async (
  id: string,
  data: Partial<RegistrationTypeCreationDTO>
) => {
  return await prisma.registrationType.update({
    where: { id },
    data,
  });
};

export const deleteRegistrationTypeRepository = async (id: string) => {
  return await prisma.registrationType.delete({
    where: { id },
  });
};
