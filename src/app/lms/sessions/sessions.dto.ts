import { ModulesDTO } from "../modules/modules.dto";

export interface CreateSessionBodyRequest {
  name?: string;
  classId?: string;
}

export interface SessionDTO {
  id: string;
  name: string;
  module: ModulesDTO[];
}
