import { Attendance, Event, Meeting } from "@prisma/client";
import { ImagePath } from "../../utils/image-path";
import { EventDTO } from "./event.dto";
import { generateOpen } from "../../utils/generate-open";

export interface AttendanceMeetingData extends Meeting {
  attendance: Attendance[];
}

export const eventsDTOMapper = (acaras: Event[]): EventDTO[] => {
  return acaras.map((acara) => {
    return {
      id: acara.id,
      description: acara.description,
      endTime: acara.endTime as Date,
      type: acara.type,
      image: acara.image.includes("https")
        ? acara.image
        : ImagePath(`event/${acara.image}`),
      name: acara.name,
      startTime: acara.startTime as Date,
      isOpen: generateOpen(acara.startTime as Date, acara.endTime as Date),
    };
  });
};
export const eventDTOMapper = (event: Event): EventDTO => {
  return {
    id: event.id,
    name: event.name,
    type: event.type,
    description: event.description,
    image: event.image.includes("https")
      ? event.image
      : ImagePath(`event/${event.image}`),
    startTime: event.startTime as Date,
    endTime: event.endTime as Date,
    isOpen: generateOpen(event.startTime as Date, event.endTime as Date),
  };
};
