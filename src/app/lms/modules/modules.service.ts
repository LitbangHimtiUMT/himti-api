import { Query } from "../../../interface/Query";
import { ErrorApp } from "../../../utils/http-error";
import { Meta } from "../../../utils/meta";
import { CreateModuleBodyRequest } from "./modules.dto";
import { getModulesMapper, ModuleData } from "./modules.mapper";
import {
  createModuleRepository,
  getModulesCountRepository,
  getModulesRepository,
} from "./modules.repository";
import { createModuleValidate } from "./modules.validate";

export const createModuleService = async ({
  name,
  sessionId,
  textModule,
  videoUrl,
  fileModule,
}: CreateModuleBodyRequest) => {
  const validate = await createModuleValidate(sessionId);

  if (validate instanceof ErrorApp) {
    return validate;
  }

  const moduleService = await createModuleRepository({
    name,
    sessionId: validate.id,
    textModule,
    videoUrl,
    fileModule,
  });

  return moduleService;
};

export const getModulesService = async (query: Query) => {
  const { page = "1", perPage = "10" } = query;
  const [modules, totalData] = await Promise.all([
    getModulesRepository(query),
    getModulesCountRepository(query),
  ]);

  const data = getModulesMapper(modules as ModuleData[]);
  return {
    data,
    meta: Meta(Number(page), Number(perPage), totalData),
  };
};
