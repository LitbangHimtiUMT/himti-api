import { ErrorApp } from "../../../utils/http-error";
import { CreateCompletedModuleBodyRequest } from "./completed-modules.dto";
import {
  createCompletedModuleRepository,
  getAlreadyCompletedModule,
} from "./completed-modules.repository";
import { createCompletedModuleValidate } from "./completed-modules.validate";
import {
  classIdFromModule,
  requireClassAccess,
} from "../../../utils/lms-access";

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
  // Progress must only be recorded for a class the caller belongs
  // to; otherwise anyone could complete any module and inflate the
  // completion percentage used for certificates.
  const denied = await requireClassAccess(
    userId as string,
    (await classIdFromModule(moduleId as string)) ?? ""
  );
  if (denied) return denied;

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
