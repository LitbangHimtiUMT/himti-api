import { prisma } from "../../config";
import { BusinessDTO, IFilterBusiness } from "./business.dto";

export const createMerchandise = async (
  data: Omit<BusinessDTO, "image"> & {
    images: string[];
  }
) => {
  return await prisma.bussiness.create({
    data: {
      price: data.price,
      title: data.title,
      description: data.description,
      contactPerson: data.contactPerson,
      type: "MERCHANDISE",
      businessImage: {
        createMany: {
          data: data.images.map((item) => ({
            image: item,
          })),
        },
      },
    },
  });
};
export const createService = async (data: BusinessDTO) => {
  return await prisma.bussiness.create({
    data: {
      ...data,
      type: "SERVICE",
    },
  });
};

export const getMerchandiseByTitle = async (title: string) => {
  return await prisma.bussiness.findFirst({
    where: {
      type: "MERCHANDISE",
      title,
    },
  });
};

export const getServiceByTitle = async (title: string) => {
  return await prisma.bussiness.findFirst({
    where: {
      type: "MERCHANDISE",
      title,
    },
  });
};

export const getMerchandises = async ({
  page,
  perPage,
  search,
}: IFilterBusiness) => {
  return await prisma.bussiness.findMany({
    where: {
      type: "MERCHANDISE",
      title: {
        contains: search,
        mode: "insensitive",
      },
    },
    include: {
      businessImage: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: perPage,
    skip: (Number(page) - 1) * Number(perPage),
  });
};
export const getMerchandisesCount = async ({ search }: IFilterBusiness) => {
  return await prisma.bussiness.count({
    where: {
      type: "MERCHANDISE",
      title: {
        contains: search,
        mode: "insensitive",
      },
    },
  });
};
export const getServices = async ({
  page,
  perPage,
  search,
}: IFilterBusiness) => {
  return await prisma.bussiness.findMany({
    where: {
      type: "SERVICE",
      title: {
        contains: search,
        mode: "insensitive",
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: perPage,
    skip: (Number(page) - 1) * Number(perPage),
  });
};
export const getServicesCount = async ({ search }: IFilterBusiness) => {
  return await prisma.bussiness.count({
    where: {
      type: "SERVICE",
      title: {
        contains: search,
        mode: "insensitive",
      },
    },
  });
};
