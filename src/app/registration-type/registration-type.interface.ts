import { RegistrationEventTypeEnum } from "@prisma/client";
import { Query } from "../../interface/Query";

export interface RegistrationTypeCreationDTO {
  name: string;
  type: RegistrationEventTypeEnum;
  year: number;
  isActive: boolean;
  image?: string | null;
  link?: string | null;
  eventId?: string | null;
}

export interface RegistrationTypeUpdateDTO {
  name?: string;
  type?: RegistrationEventTypeEnum;
  year?: number;
  isActive?: boolean;
  image?: string | null;
  link?: string | null;
  eventId?: string | null;
}

export interface RegistrationTypeDTO {
  id: string;
  name: string;
  year: number;
  image?: string | null;
  link?: string | null;
  createdAt: Date;
  type: RegistrationEventTypeEnum;
  isActive: boolean;
  eventId?: string | null;
}

export interface RegistrationTypeQuery extends Query {
  type?: RegistrationEventTypeEnum;
  isActive?: boolean | string;
  eventId?: string;
}
