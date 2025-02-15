import { ErrorApp } from "../../../utils/http-error";
import { CreateCompletedClassBodyRequest } from "./completed-classes.dto";
import { createCompletedClassRepository } from "./completed-classes.repository";
import { createCompletedClassValidate } from "./completed-classes.validate";

export const createCompletedClassService = async (
  { classId }: CreateCompletedClassBodyRequest,
  userId: string,
) => {
  const validate = await createCompletedClassValidate(
    {
      classId,
    },
    userId,
  );

  if (validate instanceof ErrorApp) {
    return validate;
  }

  const completedClass = await createCompletedClassRepository(
    {
      classId,
    },
    userId,
  );

  return completedClass;
};
