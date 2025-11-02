import { RegistrationEventTypeEnum, RegistrationType } from "@prisma/client";
import * as eventRegistrationRepository from "./event-registration.repository";
import {
  EventRegistrationCreationDTO,
  EventRegistrationDTO,
  EventRegistrationUpdateDTO,
} from "./event-registration.interface";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGE_CODE } from "../../utils/error-code";
import * as registrationTypeRepository from "../registration-type/registration-type.repository";
import { eventRegistrationMapper } from "./event-registration.mapper";

export const create = async (
  payload: EventRegistrationCreationDTO
): Promise<EventRegistrationDTO> => {
  const registrationType = await getRegistrationTypeOrThrow(
    payload.registrationTypeId
  );
  await assertUniqueRegistration(payload.userId, payload.eventId);
  const normalizedData = normalizePayload(payload, registrationType);
  const eventRegistration =
    await eventRegistrationRepository.createEventRegistrationRepository(
      normalizedData as EventRegistrationCreationDTO
    );
  return eventRegistrationMapper(eventRegistration, registrationType);
};

export const findAll = async (): Promise<EventRegistrationDTO[]> => {
  const eventRegistrations =
    await eventRegistrationRepository.getEventRegistrationsRepository();
  const registrationTypeMap = await buildRegistrationTypeMap(
    eventRegistrations
      .map((item) => item.registrationTypeId)
      .filter((id): id is string => Boolean(id))
  );
  return eventRegistrations.map((eventRegistration) =>
    eventRegistrationMapper(
      eventRegistration,
      registrationTypeMap.get(eventRegistration.registrationTypeId ?? "") ||
        null
    )
  );
};

export const findById = async (id: string): Promise<EventRegistrationDTO> => {
  const eventRegistration =
    await eventRegistrationRepository.getEventRegistrationByIdRepository(id);
  if (!eventRegistration) {
    throw new ErrorApp(
      "Event registration not found",
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  const registrationType = eventRegistration.registrationTypeId
    ? await registrationTypeRepository.getRegistrationTypeByIdRepository(
        eventRegistration.registrationTypeId
      )
    : null;
  return eventRegistrationMapper(eventRegistration, registrationType ?? null);
};

export const update = async (
  id: string,
  payload: EventRegistrationUpdateDTO
): Promise<EventRegistrationDTO> => {
  const existing =
    await eventRegistrationRepository.getEventRegistrationByIdRepository(id);
  if (!existing) {
    throw new ErrorApp(
      "Event registration not found",
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  const registrationTypeId =
    payload.registrationTypeId ?? existing.registrationTypeId;
  if (!registrationTypeId) {
    throw new ErrorApp(
      "Registration type is required",
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  const registrationType = await getRegistrationTypeOrThrow(registrationTypeId);
  const normalizedData = normalizePayload(
    {
      ...payload,
      registrationTypeId,
    },
    registrationType,
    existing
  );
  const updatedEventRegistration =
    await eventRegistrationRepository.updateEventRegistrationRepository(
      id,
      normalizedData
    );
  return eventRegistrationMapper(updatedEventRegistration, registrationType);
};

export const remove = async (id: string): Promise<boolean> => {
  await eventRegistrationRepository.deleteEventRegistrationRepository(id);
  return true;
};

const getRegistrationTypeOrThrow = async (
  registrationTypeId: string
): Promise<RegistrationType> => {
  const registrationType =
    await registrationTypeRepository.getRegistrationTypeByIdRepository(
      registrationTypeId
    );
  if (!registrationType) {
    throw new ErrorApp(
      "Registration type not found",
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  if (!registrationType.isActive) {
    throw new ErrorApp(
      "Registration type is inactive",
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  return registrationType;
};

const normalizePayload = (
  payload: EventRegistrationUpdateDTO | EventRegistrationCreationDTO,
  registrationType: RegistrationType,
  existing?: { class?: string | null; registrationTypeId?: string | null }
) => {
  const normalizedClass = resolveClassValue(
    registrationType,
    payload.class,
    existing?.class
  );
  return {
    ...payload,
    class: normalizedClass,
    registrationTypeId: registrationType.id,
  } as EventRegistrationUpdateDTO;
};

const resolveClassValue = (
  registrationType: RegistrationType,
  candidateClass?: string | null,
  fallbackClass?: string | null
) => {
  if (registrationType.type === RegistrationEventTypeEnum.SEMINAR) {
    return null;
  }
  const resolved =
    typeof candidateClass !== "undefined" ? candidateClass : fallbackClass;
  if (!resolved || resolved.trim() === "") {
    throw new ErrorApp(
      "Class is required for bootcamp and learning group registrations",
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  return resolved.trim();
};

const buildRegistrationTypeMap = async (registrationTypeIds: string[]) => {
  const uniqueIds = Array.from(new Set(registrationTypeIds));
  const registrationTypes =
    await registrationTypeRepository.getRegistrationTypesByIdsRepository(
      uniqueIds
    );
  return new Map(registrationTypes.map((item) => [item.id, item]));
};

const assertUniqueRegistration = async (
  userId?: string,
  eventId?: string
) => {
  if (!userId || !eventId) {
    return;
  }
  const existingRegistration =
    await eventRegistrationRepository.getExistEventRegistration(userId, eventId);
  if (existingRegistration) {
    throw new ErrorApp(
      "User has already registered for this event",
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
};
