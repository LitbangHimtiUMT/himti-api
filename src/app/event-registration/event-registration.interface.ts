import { RegistrationEventTypeEnum } from "@prisma/client";

export interface EventRegistrationCreationDTO {
  name: string;
  nim?: string;
  class?: string | null;
  generation?: number;
  categoryId?: string;
  image?: string;
  registrationTypeId: string;
  userId?: string;
  eventId?: string;
}

export interface EventRegistrationUpdateDTO
  extends Partial<EventRegistrationCreationDTO> {}

export interface RegistrationTypeSummaryDTO {
  id: string;
  name: string;
  type: RegistrationEventTypeEnum;
  year: number;
  isActive: boolean;
}

export interface EventRegistrationDTO {
  id: string;
  name: string;
  image?: string | null;
  class?: string | null;
  generation?: number | null;
  registrationTypeId?: string | null;
  eventId?: string | null;
  registrationType?: RegistrationTypeSummaryDTO | null;
}
