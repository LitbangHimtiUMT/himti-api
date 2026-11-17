import { Member, Structural } from "@prisma/client";
import { ImagePath } from "../../utils/image-path";

// Stored filenames resolve to public URLs; a value that already
// looks like a URL is kept as-is (older rows store full URLs).
const resolveStoredImage = (value: string | null, folder: string) => {
  if (!value) {
    return null;
  }
  return value.includes("https") ? value : ImagePath(`${folder}/${value}`);
};

export interface StructuralData extends Structural {
  Member: Member;
}

export const structuralMapper = (data: Structural[]) => {
  return data.map((item) => ({
    ...item,
    jabatan: item.jabatan?.replace(/_/g, " "),
    image: item.image.includes("https")
      ? item.image
      : ImagePath(`struktural/${item.image}`),
    signatureImage: resolveStoredImage(item.signatureImage, "struktural"),
  }));
};

export const getStructuralDTOMapper = (data: StructuralData) => {
  return {
    id: data.id,
    jabatan: data.jabatan,
    department: data.department,
    image: data.image.includes("https")
      ? data.image
      : ImagePath(`struktural/${data.image}`),
    signatureImage: resolveStoredImage(data.signatureImage, "struktural"),
    memberId: data.memberId,
    member: {
      id: data.Member.id,
      name: data.Member.name as string,
      nim: data.Member.nim as string,
    },
    isActive: data.isActive,
    createdAt: data.createdAt,
  };
};
