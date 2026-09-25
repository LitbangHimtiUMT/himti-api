import { RegistrationType } from "@prisma/client";
import { RegistrationTypeDTO } from "./registration-type.interface";
import { ImagePath } from "../../utils/image-path";
import { BUCKET_FOLDER } from "../../utils/upload-file-to-storage";

// Mapper function to filter important fields
export const registrationTypeMapper = (
  registrationType: RegistrationType
): RegistrationTypeDTO => {
  let mappedImage: string | null = null;
  if (registrationType.image) {
    if (
      registrationType.image.startsWith("http://") ||
      registrationType.image.startsWith("https://")
    ) {
      mappedImage = registrationType.image;
    } else {
      mappedImage = ImagePath(
        `${BUCKET_FOLDER.registrationType}/${registrationType.image}`
      );
    }
  }

  return {
    id: registrationType.id,
    name: registrationType.name,
    year: registrationType.year,
    image: mappedImage,
    link: registrationType.link,
    type: registrationType.type,
    createdAt: registrationType.createdAt,
    isActive: registrationType.isActive,
    eventId: registrationType.eventId,
  };
};
