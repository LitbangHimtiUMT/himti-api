import { prisma } from "../../config";
import { EventRegistrationCreationDTO } from "./event-registration.interface";

export const createEventRegistrationRepository = async (
  data: EventRegistrationCreationDTO
) => {
  return await prisma.eventRegistration.create({
    data,
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
