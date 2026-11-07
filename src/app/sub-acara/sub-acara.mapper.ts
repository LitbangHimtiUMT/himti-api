import { SubAcara } from "@prisma/client";
import { ImagePath } from "../../utils/image-path";

const mapImage = (image: string | null): string | null => {
  if (!image) return image;
  return image.includes("https")
    ? image
    : ImagePath(`sub-acara/${image}`);
};

export const subAcaraListMapper = (items: SubAcara[]): SubAcara[] => {
  return items.map((item) => ({
    ...item,
    image: mapImage(item.image),
  }));
};

export const subAcaraDetailMapper = (item: SubAcara): SubAcara => {
  return {
    ...item,
    image: mapImage(item.image),
  };
};
