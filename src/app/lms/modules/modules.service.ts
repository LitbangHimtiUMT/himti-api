import { ErrorApp } from "../../../utils/http-error";
import { CreateModuleBodyRequest } from "./modules.dto";
import { createModuleRepository } from "./modules.repository";
import { createModuleValidate } from "./modules.validate";

export const createModuleService = async ({
  name,
  sessionId,
  textModule,
  videoUrl,
  fileModule,
}: CreateModuleBodyRequest) => {
  const validate = await createModuleValidate({
    sessionId,
  });

  if (validate instanceof ErrorApp) {
    return validate;
  }

  const moduleService = await createModuleRepository({
    name,
    sessionId,
    textModule,
    videoUrl,
    fileModule,
  });

  return moduleService;
};
