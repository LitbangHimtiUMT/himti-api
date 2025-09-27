import { prisma } from "../../config";
import { RegistrationTypeCreationDTO } from "./registration-type.interface";

export const createRegistrationTypeRepository = async (
  data: RegistrationTypeCreationDTO
) => {
  return await prisma.registrationType.create({
    data: {
      name: data.name,
      type: data.type,
      year: data.year,
      isActive: typeof data.isActive === "boolean" ? data.isActive : true,
    },
  });
};

export const getRegistrationTypesRepository = async () => {
  return await prisma.registrationType.findMany();
};

export const getRegistrationTypeByIdRepository = async (id: string) => {
  return await prisma.registrationType.findUnique({
    where: { id },
  });
};

export const updateRegistrationTypeRepository = async (
  id: string,
  data: Partial<RegistrationTypeCreationDTO>
) => {
  return await prisma.registrationType.update({
    where: { id },
    data,
  });
};

export const deleteRegistrationTypeRepository = async (id: string) => {
  return await prisma.registrationType.delete({
    where: { id },
  });
};
