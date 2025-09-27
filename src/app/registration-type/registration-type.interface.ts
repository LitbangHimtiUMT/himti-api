import { RegistrationEventTypeEnum } from "@prisma/client";

export interface RegistrationTypeCreationDTO {
  name: string;
  type: RegistrationEventTypeEnum;
  year: number;
  isActive: boolean;
}

export interface RegistrationTypeDTO {
  id: string;
  name: string;
  year: number;
  type: RegistrationEventTypeEnum;
  isActive: boolean;
}
