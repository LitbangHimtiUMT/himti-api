import { EventType } from "@prisma/client";
import { Query } from "../../interface/Query";

export interface EventBodyDTO {
  id?: string;
  name?: string;
  description?: string;
  image?: string;
  isOpen?: boolean;
  startTime?: Date;
  type?: EventType;
  endTime?: Date;
}
export interface CreateEventBodyRequest {
  id?: string;
  name?: string;
  description?: string;
  image?: Express.Multer.File | string;
  isOpen?: boolean;
  type?: EventType;
  startTime?: Date | string;
  endTime?: Date | string;
}

export interface EventDTO {
  id: string;
  name: string;
  type: EventType
  image: string;
  startTime: Date;
  endTime: Date;
  description?: string | null;
  isOpen: boolean;
}

export interface QueryEvent extends Query {
  type?: EventType;
  withDeleted?: string;
  onlyDeleted?: string;
}
