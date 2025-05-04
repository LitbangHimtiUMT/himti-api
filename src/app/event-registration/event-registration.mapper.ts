import { Event, EventRegistration } from "@prisma/client";
import { UserData } from "../point/point.mapper";
import { generateOpen } from "../../utils/generate-open";
import { ImagePath } from "../../utils/image-path";
import { BUCKET_FOLDER } from "../../utils/upload-file-to-storage";

export interface EventRegistrationData extends EventRegistration {
  event: Event;
  user: UserData;
}

export const getHistoryEventRegistrationDTOMapper = (
  data: EventRegistrationData[]
) => {
  return data.map((item) => ({
    id: item.id,
    image: item.image
      ? ImagePath(`${BUCKET_FOLDER.eventRegistration}/${item.image}`)
      : null,
    class: item.class,
    material: item.material,
    event: {
      id: item.event.id,
      name: item.event.name,
      image: item.event.image,
      startTime: item.event.startTime as Date,
      endTime: item.event.endTime as Date,
      isOpen: generateOpen(item.event.startTime, item.event.endTime),
    },
    user: {
      id: item.user.id,
      name: item.user.name,
      nim: item.user.nim,
      photo: item.user.photo
        ? ImagePath(`${BUCKET_FOLDER.user}/${item.user.photo}`)
        : null,
      generation: {
        id: item.user.Member.Generation.id,
        year: Number(item.user.Member.Generation.year),
      },
    },
  }));
};
