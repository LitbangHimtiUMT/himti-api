import { Class, Session, User } from "@prisma/client";
import { getModulesMapper, ModuleData } from "../modules/modules.mapper";

export interface SessionData extends Session {
  module: ModuleData[];
  class?: Class & { user: User };
}
// : Promise<SessionDTO[]>
export const getSessionsMapper = (data: SessionData[]) => {
  const datas = data.map((item, index) => {
    let progress = 0;
    for (const completed of item.module) {
      progress += completed._count?.completedModule ?? 0;
    }
    const currentProgress = (progress / item.module.length) * 100 || 0;

    // Cek progress sesi sebelumnya
    const prevSession = index > 0 ? data[index - 1] : null;
    let isLocked = false;

    if (index && prevSession) {
      let prevProgress = 0;
      for (const completed of prevSession.module) {
        prevProgress += completed._count?.completedModule ?? 0;
      }
      const prevProgressPercent =
        (prevProgress / prevSession.module.length) * 100;
      isLocked = prevProgressPercent < 100;
    }

    return {
      id: item.id,
      name: item.name,
      module: getModulesMapper(item.module),
      progress: currentProgress,
      progressStatus: currentProgress === 100 ? "Completed" : "In Progress",
      isLocked: isLocked,
    };
  });

  return datas;
};

export const getSessionMapper = (data: SessionData) => {
  return {
    id: data.id,
    name: data.name,
    class: data.class
      ? {
          id: data.class.id,
          name: data.class.name,
          creator: {
            id: data.class.user.id,
            name: data.class.user.name,
          },
        }
      : null,
  };
};
