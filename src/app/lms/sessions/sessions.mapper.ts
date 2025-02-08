import { Session } from "@prisma/client";
import { getModulesMapper, ModuleData } from "../modules/modules.mapper";
import { SessionDTO } from "./sessions.dto";

interface SessionData extends Session {
  module: ModuleData[];
}

export const getSessionsMapper = (data: SessionData[]): SessionDTO[] => {
  return data.map((item) => ({
    id: item.id,
    name: item.name,
    module: getModulesMapper(item.module),
  }));
};
