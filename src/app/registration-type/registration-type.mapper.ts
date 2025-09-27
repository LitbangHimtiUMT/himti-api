import { RegistrationType } from "@prisma/client";
import { RegistrationTypeDTO } from "./registration-type.interface";

// Mapper function to filter important fields
export const registrationTypeMapper = (registrationType: RegistrationType): RegistrationTypeDTO => {
  return {
    id: registrationType.id,
    name: registrationType.name,
    year: registrationType.year,
    type: registrationType.type,
    isActive: registrationType.isActive,
  };
};
