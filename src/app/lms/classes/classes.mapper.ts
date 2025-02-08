import { Category, Class, ClassParticipant, User } from "@prisma/client";
import { ClassDTO } from "./classes.dto";
import { ImagePath } from "../../../utils/image-path";
import { BUCKET_FOLDER } from "../../../utils/upload-file-to-storage";

interface ClassData extends Class {
  user: User;
  category: Category;
  classParticipant: Pick<ClassParticipant, "id" | "userId">[];
}

export const getClassMapper = (data: ClassData[]): ClassDTO[] => {
  return data.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    status: item.status,
    level: item.level,
    category: {
      id: item.category.id,
      name: item.category.name,
    },
    thumbnail: item.thumbnail,
    price: Number(item.price),
    totalParticipant: item.classParticipant.length,
    creator: {
      id: item.user.id,
      name: item.user.name,
      email: item.user.email,
      photo: item.user.photo
        ? ImagePath(`${BUCKET_FOLDER.user}/${item.user.photo}`)
        : null,
    },
  }));
};
