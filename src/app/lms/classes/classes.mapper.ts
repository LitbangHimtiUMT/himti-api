import {
  Category,
  Class,
  ClassParticipant,
  CompletedClass,
  Session,
  User,
} from "@prisma/client";
import { ImagePath } from "../../../utils/image-path";
import { BUCKET_FOLDER } from "../../../utils/upload-file-to-storage";
import { ModuleData } from "../modules/modules.mapper";
import { ClassDTO } from "./classes.dto";

interface SessionData extends Session {
  module: ModuleData[];
}

export interface ClassData extends Class {
  user: User;
  session: SessionData[];
  category: Category;
  classParticipant: Pick<ClassParticipant, "id" | "userId">[];
  completedClass?: CompletedClass[];
}

export interface ClassParticipantData extends ClassParticipant {
  class: ClassData;
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

export const getClassAccessMapper = (data: ClassParticipantData[]) => {
  const total = {
    module: 0,
    completed: 0,
  };

  for (const item of data) {
    for (const modules of item.class.session) {
      total.module += modules.module.length;
      for (const completed of modules.module) {
        total.completed += completed._count?.completedModule ?? 0;
      }
    }
  }

  return data.map((item) => ({
    id: item.class.id,
    name: item.class.name,
    description: item.class.description,
    status: item.class.status,
    thumbnail: ImagePath(`${BUCKET_FOLDER.class}/${item.class.thumbnail}`),
    level: item.class.level,
    price: Number(item.class.price),
    creator: {
      id: item.class.user.id,
      name: item.class.user.name,
    },
    category: {
      id: item.class.category.id,
      name: item.class.category.name,
    },
    progressStatus:
      (total.completed / total.module) * 100 === 100
        ? "Completed"
        : "In Progress",
    total: {
      ...total,
      precentage: (total.completed / total.module) * 100,
    },
  }));
};
