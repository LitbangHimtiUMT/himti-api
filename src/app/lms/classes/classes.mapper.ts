import {
  Category,
  Certificate,
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
  _count: {
    classParticipant: number;
    session: number;
  };
  isAlreadyJoin?: boolean;
  certificate: Certificate[];
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
    code: btoa(item.code),
    category: {
      id: item.category.id,
      name: item.category.name,
    },
    thumbnail: ImagePath(`${BUCKET_FOLDER.class}/${item.thumbnail}`),
    price: Number(item.price),
    totalParticipant: item._count.classParticipant,
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

export const getDetailClassMapper = (
  data: ClassData & { isAlreadyJoin?: boolean }
): ClassDTO => {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    status: data.status,
    level: data.level,
    code: btoa(data.code),
    // isAlreadyJoin: data.isAlreadyJoin,
    category: {
      id: data.category.id,
      name: data.category.name,
    },
    sessions: (data?.session ?? []).map(session => {
      // Calculate isComplete for each module
      const modulesWithCompletion = session.module.map(module => ({
        id: module.id,
        name: module.name,
        fileModule: module.fileModule ? ImagePath(`${BUCKET_FOLDER.modules}/${module.fileModule}`) : null,
        textModule: module.textModule,
        videoUrl: module.videoUrl,
        isCompleted: module.completedModule.length > 0 // Assuming completedModule has entries if completed
      }));
      
      // Session is complete if all its modules are complete
      const isSessionComplete = modulesWithCompletion.every(module => module.isCompleted);
      
      return {
        id: session.id,
        name: session.name,
        isCompleted: session.module.length && isSessionComplete,
        modules: modulesWithCompletion
      }
    }),
    thumbnail: data.thumbnail,
    price: Number(data.price),
    totalParticipant: data._count.classParticipant,
    creator: {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      photo: data.user.photo
        ? ImagePath(`${BUCKET_FOLDER.user}/${data.user.photo}`)
        : null,
    },
  };
};

export const getClassAccessMapper = (
  data: ClassParticipantData[],
  userId: string
) => {
  return data.map((item) => {
    const total = {
      module: 0,
      completed: 0,
    };

    for (const modules of item.class.session) {
      total.module += modules.module.length;
      for (const completed of modules.module) {
        total.completed += completed._count?.completedModule ?? 0;
      }
    }
    return {
      id: item.class.id,
      participantId: item.id,
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
        precentage: ((total.completed / total.module) * 100) || 0,
      },
      totalSession: (item.class.session ?? []).length ?? 0,
      // sessions: item.class.session.map((session) => ({
      //   id: session.id,
      //   name: session.name,
      // })),
      certificate: item.class.certificate.find(
        (cert) => cert.classId === item.classId && item.userId === userId
      ) ?? null,
    };
  });
};
