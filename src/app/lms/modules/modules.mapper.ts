import { Assignment, CompletedModule, Module } from "@prisma/client";
import {
  BUCKET_FOLDER,
  GetPublicURL,
} from "../../../utils/upload-file-to-storage";
import { youtubeID } from "../../../utils/youtbe-url";
import { ModulesDTO } from "./modules.dto";

export interface ModuleData extends Module {
  assignment: Assignment | null;
  completedModule: CompletedModule[];
  _count?: {
    completedModule?: number;
  };
}

export const getModulesMapper = (data: ModuleData[]): ModulesDTO[] => {
  return data.map((item) => ({
    id: item.id,
    name: item.name,
    file: {
      fileName: item.fileModule,
      url: item.fileModule
        ? GetPublicURL(`${BUCKET_FOLDER.modules}/${item.fileModule}`)
        : null,
    },
    textModule: item.textModule,
    videoUrl: item.videoUrl,
    youtubeId: item.videoUrl ? youtubeID(item.videoUrl) : null,
    thumbnailUrl: item.videoUrl
      ? `https://i.ytimg.com/vi/${youtubeID(item.videoUrl)}/hqdefault.jpg`
      : null,
    assignment: item.assignment
      ? {
          id: item.assignment?.id,
          title: item.assignment?.title,
          isFinalAssigment: item.assignment?.isFinalAssigment,
          dueDate: item.assignment?.dueDate,
        }
      : null,
  }));
};

export const getModuleMapper = (data: ModuleData): ModulesDTO => {
  return {
    id: data.id,
    name: data.name,
    file: {
      fileName: data.fileModule,
      url: data.fileModule
        ? GetPublicURL(`${BUCKET_FOLDER.modules}/${data.fileModule}`)
        : null,
    },
    textModule: data.textModule,
    videoUrl: data.videoUrl,
    youtubeId: data.videoUrl ? youtubeID(data.videoUrl) : null,
    thumbnailUrl: data.videoUrl
      ? `https://i.ytimg.com/vi/${youtubeID(data.videoUrl)}/hqdefault.jpg`
      : null,
    assignment: data.assignment
      ? {
          id: data.assignment?.id,
          title: data.assignment?.title,
          isFinalAssigment: data.assignment?.isFinalAssigment,
          dueDate: data.assignment?.dueDate,
        }
      : null,
  };
};
