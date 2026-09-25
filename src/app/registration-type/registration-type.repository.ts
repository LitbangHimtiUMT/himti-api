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
      image: data.image || null,
      link: data.link || null,
      eventId: data.eventId && data.eventId.trim() !== "" ? data.eventId : null,
    },
  });
};

export const getRegistrationTypesRepository = async (
  query: RegistrationTypeQuery = {}
) => {
  const { type, eventId, search, isActive } = query;
  return prisma.registrationType.findMany({
    where: {
      ...(search && { name: { contains: search, mode: "insensitive" } }),
      ...(type && { type }),
      ...(isActive !== undefined && { isActive: isActive === true || isActive === "true" }),
      ...(eventId && { eventId }),
    },
    ...queryPagination(query),
  });
};

export const getRegistrationTypesCountRepository = async (
  query: RegistrationTypeQuery = {}
) => {
  const { type, eventId, search, isActive } = query;
  return prisma.registrationType.count({
    where: {
      ...(search && { name: { contains: search, mode: "insensitive" } }),
      ...(type && { type }),
      ...(isActive !== undefined && { isActive: isActive === true || isActive === "true" }),
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
  const payload: any = { ...data };
  if (typeof payload.eventId !== "undefined") {
    payload.eventId =
      payload.eventId && payload.eventId.trim() !== "" ? payload.eventId : null;
  }
  return await prisma.registrationType.update({
    where: { id },
    data: payload,
  });
};

export const deleteRegistrationTypeRepository = async (id: string) => {
  return await prisma.registrationType.delete({
    where: { id },
  });
};
