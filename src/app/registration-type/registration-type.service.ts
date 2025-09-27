import * as registrationTypeRepository from "./registration-type.repository";
import {
  RegistrationTypeCreationDTO,
  RegistrationTypeDTO,
} from "./registration-type.interface";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGE_CODE } from "../../utils/error-code";
import { registrationTypeMapper } from "./registration-type.mapper";

export const create = async (
  data: RegistrationTypeCreationDTO
): Promise<RegistrationTypeDTO> => {
  const registrationType =
    await registrationTypeRepository.createRegistrationTypeRepository(data);
  return registrationTypeMapper(registrationType);
};

export const getAll = async (): Promise<RegistrationTypeDTO[]> => {
  const registrationTypes =
    await registrationTypeRepository.getRegistrationTypesRepository();
  return registrationTypes.map(registrationTypeMapper);
};

export const getById = async (id: string): Promise<RegistrationTypeDTO> => {
  const registrationType =
    await registrationTypeRepository.getRegistrationTypeByIdRepository(id);
  if (!registrationType) {
    throw new ErrorApp(
      "Registration Type not found",
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  return registrationTypeMapper(registrationType);
};

export const update = async (
  id: string,
  data: Partial<RegistrationTypeCreationDTO>
): Promise<RegistrationTypeDTO> => {
  const updatedRegistrationType =
    await registrationTypeRepository.updateRegistrationTypeRepository(id, data);
  return {
    id: updatedRegistrationType.id,
    name: updatedRegistrationType.name,
    isActive: updatedRegistrationType.isActive,
    year: updatedRegistrationType.year,
    type: updatedRegistrationType.type,
  };
};

export const remove = async (id: string) => {
  const registrationType = await getById(id);
  if (registrationType instanceof ErrorApp) return registrationType;
  return await registrationTypeRepository.deleteRegistrationTypeRepository(
    registrationType.id
  );
};
