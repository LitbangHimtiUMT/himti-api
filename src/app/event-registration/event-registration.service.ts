import { RegistrationEventTypeEnum, RegistrationType } from "@prisma/client";
import sharp from "sharp";
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
import {
  BUCKET_FOLDER,
  FileType,
  RemoveFileFromStorage,
  UploadFileToStorage,
} from "../../utils/upload-file-to-storage";
import { environment } from "../../libs";

export const create = async (
  payload:
    | EventRegistrationCreationDTO
    | (EventRegistrationCreationDTO & { image?: Express.Multer.File | string })
) => {
  const registrationType = await getRegistrationTypeOrThrow(
    payload.registrationTypeId
  );
  const unique = await assertUniqueRegistration(
    payload.userId,
    payload.eventId
  );
  if (unique instanceof ErrorApp) return unique;

  // Extract image file for validation
  const maybeFile = (payload as unknown as { image?: unknown }).image as
    | Express.Multer.File
    | string
    | undefined;

  // Validate bootcamp-specific requirements
  validateBootcampRequirements(registrationType, payload.generation, maybeFile);

  let filename: string | undefined;
  const normalizedData = normalizePayload(payload, registrationType);
  try {
    if (maybeFile && typeof maybeFile !== "string") {
      const file = maybeFile as Express.Multer.File;
      if ((file.size as number) > 3 * 1024 * 1024) {
        throw new ErrorApp(
          "Image size exceeds 3MB",
          400,
          MESSAGE_CODE.BAD_REQUEST
        );
      }
      filename = `${file.originalname.replace(
        FileType[file.mimetype],
        ""
      )} - ${+new Date()}.webp`;
      const quality = file.size > 5 * 1024 * 1024 ? 75 : 100;
      const compress = await sharp(file.buffer).webp({ quality }).toBuffer();
      await UploadFileToStorage({
        Bucket: environment.STORAGE.BUCKET,
        Key: `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.eventRegistration}/${filename}`,
        Body: compress,
        ContentType: FileType["image/webp"],
        ACL: "public-read",
      });
      (normalizedData as EventRegistrationCreationDTO).image = filename;
    }

    const eventRegistration =
      await eventRegistrationRepository.createEventRegistrationRepository(
        normalizedData as EventRegistrationCreationDTO
      );
    return eventRegistrationMapper(eventRegistration, registrationType);
  } catch (error) {
    console.log({ error, filename });
    if (filename) {
      await RemoveFileFromStorage(
        `${environment.STORAGE.BUCKET_FOLDER}/${BUCKET_FOLDER.eventRegistration}/${filename}`
      );
    }
    if (error instanceof ErrorApp) throw error;
    throw new ErrorApp(
      "Failed to create registration",
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
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

const assertUniqueRegistration = async (userId?: string, eventId?: string) => {
  if (!userId || !eventId) {
    return;
  }
  const existingRegistration =
    await eventRegistrationRepository.getExistEventRegistration(
      userId,
      eventId
    );
  if (existingRegistration) {
    return new ErrorApp(
      "User has already registered for this event",
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
};

const validateBootcampRequirements = (
  registrationType: RegistrationType,
  generation?: number,
  imageFile?: Express.Multer.File | string
) => {
  if (registrationType.type === RegistrationEventTypeEnum.BOOTCAMP) {
    // Validate generation is required for bootcamp
    if (!generation || generation <= 0) {
      throw new ErrorApp(
        "Generation is required for bootcamp registration",
        400,
        MESSAGE_CODE.BAD_REQUEST
      );
    }

    // Validate image is required for bootcamp
    if (!imageFile) {
      throw new ErrorApp(
        "Image is required for bootcamp registration",
        400,
        MESSAGE_CODE.BAD_REQUEST
      );
    }
  }
};
