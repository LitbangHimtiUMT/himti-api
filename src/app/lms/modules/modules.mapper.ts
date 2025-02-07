import { Module } from "@prisma/client";
import { ModulesDTO } from "./modules.dto";
import { youtubeID } from "../../../utils/youtbe-url";

export const getModulesMapper = (data: Module[]): ModulesDTO[] => {
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
  }));
};
