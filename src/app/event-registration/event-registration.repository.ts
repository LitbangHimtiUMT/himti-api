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
