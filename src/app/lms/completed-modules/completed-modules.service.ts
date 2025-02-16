import { ErrorApp } from "../../../utils/http-error";
import { CreateCompletedModuleBodyRequest } from "./completed-modules.dto";
import {
  createCompletedModuleRepository,
  getAlreadyCompletedModule,
} from "./completed-modules.repository";
import { createCompletedModuleValidate } from "./completed-modules.validate";

export const createCompletedModuleService = async ({
  moduleId,
  userId,
}: CreateCompletedModuleBodyRequest) => {
  const validate = await createCompletedModuleValidate({
    moduleId,
    userId,
  });

  if (validate instanceof ErrorApp) {
    return validate;
  }

  const getAlreadyModule = await getAlreadyCompletedModule(
    moduleId as string,
    userId as string
  );

  if (getAlreadyModule) return getAlreadyModule;

  const completedModule = await createCompletedModuleRepository({
    moduleId,
    userId,
  });

  return completedModule;
};
