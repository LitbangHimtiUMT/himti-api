import { prisma } from "../../config";
import { BusinessDTO, IFilterBusiness } from "./business.dto";

export const createMerchandise = async (data: BusinessDTO) => {
  return await prisma.bussiness.create({
    data: {
      startPrice: Number(data.startPrice),
      endPrice: Number(data.endPrice),
      title: data.title,
      description: data.description,
      url: data.url,
      contactPerson: data.contactPerson,
      type: "MERCHANDISE",
    },
  });
};

export const createBusinessImage = async (
  businessId: number,
  image: string
) => {
  return await prisma.businessImage.create({
    data: {
      image,
      businessId: Number(businessId),
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

export const getBusinessById = async (businessId: number) => {
  return await prisma.bussiness.findUnique({
    where: {
      id: businessId,
    },
  });
};
