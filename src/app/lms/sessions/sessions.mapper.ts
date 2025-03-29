import { Session } from "@prisma/client";
import { getModulesMapper, ModuleData } from "../modules/modules.mapper";
import { SessionDTO } from "./sessions.dto";

export interface SessionData extends Session {
  module: ModuleData[];
}

export const getSessionsMapper = (data: SessionData[]): SessionDTO[] => {
  return data.map((item) => {
    let progress = 0;
    for (const completed of item.module) {
      progress += completed._count?.completedModule ?? 0;
    }
    return {
      id: item.id,
      name: item.name,
      module: getModulesMapper(item.module),
      progress: ((progress / item.module.length) * 100) || 0,
      progressStatus:
      (progress / item.module.length) * 100 === 100
        ? "Completed"
        : "In Progress",
    };
  });
};
