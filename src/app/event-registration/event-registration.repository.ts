import { prisma } from "../../config";
import { Query } from "../../interface/Query";
import { queryPagination } from "../../utils/pagination";
import { EventRegistrationCreationDTO } from "./event-registration.interface";

export const createEventRegistrationRepository = async (
  data: EventRegistrationCreationDTO
) => {
  return await prisma.eventRegistration.create({
    data: {
      ...data,
      generation: data.generation ? Number(data.generation) : undefined,
    },
  });
};

export const getEventRegistrationByNIM = async (
  nim: string,
  registrationTypeId: string,
  eventId?: string
) => {
  return prisma.eventRegistration.findFirst({
    where: {
      nim,
      eventId,
      registrationTypeId,
    },
  });
};

export const getEventRegistrationsRepository = async () => {
  return await prisma.eventRegistration.findMany();
};

export const getEventRegistrationByIdRepository = async (id: string) => {
  return await prisma.eventRegistration.findUnique({
    where: { id },
  });
};

export const updateEventRegistrationRepository = async (
  id: string,
  data: Partial<EventRegistrationCreationDTO>
) => {
  return await prisma.eventRegistration.update({
    where: { id },
    data,
  });
};

export const deleteEventRegistrationRepository = async (id: string) => {
  return await prisma.eventRegistration.delete({
    where: { id },
  });
};

export const getEventRegistrationByUserId = async (userId: string) => {
  return await prisma.eventRegistration.findMany({
    where: {
      userId: userId,
    },
    include: {
      user: {
        include: {
          Member: {
            include: { Generation: true },
          },
        },
      },
    },
  });
};

export const getExistEventRegistration = async (
  userId: string,
  eventId: string
) => {
  return await prisma.eventRegistration.findFirst({
    where: {
      userId: userId,
      eventId: eventId,
    },
  });
};

export const getEventRegistrationsByRegistrationTypeRepository = async (
  registrationTypeId: string,
  query: Query
) => {
  const [data, total] = await Promise.all([
    prisma.eventRegistration.findMany({
      where: {
        registrationTypeId,
      },
      ...queryPagination(query),
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.eventRegistration.count({
      where: {
        registrationTypeId,
      },
    }),
  ]);

  return { data, total };
};

export const getEventRegistrationsByRegistrationTypeNoPaginationRepository =
  async (registrationTypeId: string) => {
    return await prisma.eventRegistration.findMany({
      where: {
        registrationTypeId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  };
