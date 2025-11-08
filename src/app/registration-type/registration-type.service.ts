import { RegistrationEventTypeEnum } from "@prisma/client";
import * as registrationTypeRepository from "./registration-type.repository";
import {
  RegistrationTypeCreationDTO,
  RegistrationTypeDTO,
  RegistrationTypeQuery,
} from "./registration-type.interface";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGE_CODE } from "../../utils/error-code";
import { registrationTypeMapper } from "./registration-type.mapper";
import { Meta } from "../../utils/meta";

export const create = async (
  data: RegistrationTypeCreationDTO
): Promise<RegistrationTypeDTO> => {
  const registrationType =
    await registrationTypeRepository.createRegistrationTypeRepository(data);
  return registrationTypeMapper(registrationType);
};

export const getAll = async (query: RegistrationTypeQuery = {}) => {
  const { page = "1", perPage = "10" } = query;
  const [registrationTypes, total] = await Promise.all([
    registrationTypeRepository.getRegistrationTypesRepository(query),
    registrationTypeRepository.getRegistrationTypesCountRepository(query),
  ]);
  const meta = Meta(Number(page), Number(perPage), total);
  return {
    meta,
    data: registrationTypes.map(registrationTypeMapper),
  };
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
  return registrationTypeMapper(updatedRegistrationType);
};

export const remove = async (id: string) => {
  const registrationType = await getById(id);
  if (registrationType instanceof ErrorApp) return registrationType;
  return await registrationTypeRepository.deleteRegistrationTypeRepository(
    registrationType.id
  );
};

export const getEventTypeOptions = () => {
  return Object.values(RegistrationEventTypeEnum).map((value) => ({
    value,
    label: value
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
  }));
};
