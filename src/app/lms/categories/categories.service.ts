import { Query } from "../../../interface/Query";
import { MESSAGE_CODE } from "../../../utils/error-code";
import { ErrorApp } from "../../../utils/http-error";
import { MESSAGES } from "../../../utils/messages";
import { Meta } from "../../../utils/meta";
import { CreateCategoryDAO, UpdateCategoryDAO } from "./categories.dao";
import { getCategoriesDTOMapper } from "./categories.mapper";
import {
  createCategoryRepository,
  deleteCategoryRepository,
  getCategoriesCountRepository,
  getCategoriesRepository,
  getCategoryById,
  getCategoryNameExcludeIdRepository,
  getCategoryNameRepository,
  updateCategoryRepository,
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

export const getCategoriesService = async (query: Query) => {
  const { page = "1", perPage = "10" } = query;
  const [categories, totalData] = await Promise.all([
    getCategoriesRepository(query),
    getCategoriesCountRepository(query),
  ]);

  const meta = Meta(Number(page), Number(perPage), totalData);
  const data = getCategoriesDTOMapper(categories);

  return {
    data,
    meta,
  };
};

export const getCategoryByIdService = async (categoryId: string) => {
  const category = await getCategoryById(categoryId);
  if (!category) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.CATEGORY,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  return category;
};

export const updateCategoryService = async (
  categoryId: string,
  data: UpdateCategoryDAO
) => {
  const category = await getCategoryById(categoryId);
  if (!category) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.CATEGORY,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  const duplicate = await getCategoryNameExcludeIdRepository(
    data.name,
    categoryId
  );
  if (duplicate) {
    return new ErrorApp(
      MESSAGES.ERROR.ALREADY.CATEGORY,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  return await updateCategoryRepository(categoryId, data);
};

export const deleteCategoryService = async (categoryId: string) => {
  const category = await getCategoryById(categoryId);
  if (!category) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.CATEGORY,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  return await deleteCategoryRepository(categoryId);
};
