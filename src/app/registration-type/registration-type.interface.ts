import { RegistrationEventTypeEnum } from "@prisma/client";
import { Query } from "../../interface/Query";

export interface RegistrationTypeCreationDTO {
  name: string;
  type: RegistrationEventTypeEnum;
  year: number;
  isActive: boolean;
  eventId?: string | null;
}

export interface RegistrationTypeDTO {
  id: string;
  name: string;
  year: number;
  createdAt: Date;
  type: RegistrationEventTypeEnum;
  isActive: boolean;
  eventId?: string | null;
}

export interface RegistrationTypeQuery extends Query {
  type?: RegistrationEventTypeEnum;
  isActive?: boolean;
  eventId?: string;
}
