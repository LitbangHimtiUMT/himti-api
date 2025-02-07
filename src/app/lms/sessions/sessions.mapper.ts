import { Session } from "@prisma/client";
import { SessionDTO } from "./sessions.dto";

export const getSessionsMapper = (data: Session[]): SessionDTO[] => {
  return data.map((item) => ({
    id: item.id,
    name: item.name,
  }));
};
