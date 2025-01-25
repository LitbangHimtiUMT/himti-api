import { MESSAGE_CODE } from "../../../utils/error-code";
import { ErrorApp } from "../../../utils/http-error";
import { MESSAGES } from "../../../utils/messages";
import { CreateCategoryDAO } from "./categories.dao";
import {
  createCategoryRepository,
  getCategoryNameRepository,
} from "./categories.repository";

export const createCategoryService = async (data: CreateCategoryDAO) => {
  const existingCategory = await getCategoryNameRepository(data.name);
  if (
    existingCategory &&
    existingCategory.name?.toLowerCase() === data.name.toLowerCase()
  ) {
    return new ErrorApp(
      MESSAGES.ERROR.ALREADY.CATEGORY,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  const result = await createCategoryRepository({
    name: data.name,
  });
  return result;
};
