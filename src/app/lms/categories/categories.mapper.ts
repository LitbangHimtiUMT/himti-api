import { Category, Class } from "@prisma/client";

interface CategoryData extends Category {
  class?: Class[];
  _count?: {
    class: number;
  };
}

export const getCategoriesDTOMapper = (data: CategoryData[]) => {
  return data.map((item) => ({
    id: item.id,
    name: item.name,
    classCount: item._count?.class,
  }));
};
