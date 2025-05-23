import { prisma } from "../../config";
import { EventRegistrationCreationDTO } from "./event-registration.dto";

export const registerEventRepository = async (
  data: Omit<EventRegistrationCreationDTO, "image"> & { image: string }
) => {
  return await prisma.eventRegistration.create({
    data: {
      eventId: data.eventId,
      userId: data.userId,
      image: data.image,
      material: data.material,
      class: data.class,
    },
  });
};

export const getEventRegistrationByUserId = async (userId: string) => {
  return await prisma.eventRegistration.findMany({
    where: {
      userId: userId,
    },
    include: {
      event: true,
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

export const getExistEventRegistration = async(userId: string, eventId: string) => {
  return await prisma.eventRegistration.findFirst({
    where: {
      userId: userId,
      eventId: eventId
    }
  })
}