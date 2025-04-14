import { Assignment, CompletedModule, Module } from "@prisma/client";
import { ModulesDTO } from "./modules.dto";
import { youtubeID } from "../../../utils/youtbe-url";

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
    fileModule: item.fileModule,
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
