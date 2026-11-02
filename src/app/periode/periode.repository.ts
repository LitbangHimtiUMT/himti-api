import { prisma } from "../../config";
import { CreatePeriodeDTO, UpdatePeriodeDTO } from "./periode.dto";

export const findPeriodByString = async (period: string) => {
  return await prisma.periode.findUnique({
    where: { period },
  });
};

export const findPeriodById = async (id: string) => {
  return await prisma.periode.findUnique({
    where: { id },
  });
};

export const findActivePeriod = async () => {
  return await prisma.periode.findFirst({
    where: { isActive: true },
  });
};

export const findAllPeriods = async () => {
  return await prisma.periode.findMany({
    orderBy: { period: "desc" },
  });
};

export const createPeriod = async (data: CreatePeriodeDTO) => {
  return await prisma.periode.create({
    data,
  });
};

export const updatePeriod = async (id: string, data: UpdatePeriodeDTO) => {
  return await prisma.periode.update({
    where: { id },
    data,
  });
};

export const deletePeriod = async (id: string) => {
  return await prisma.periode.delete({
    where: { id },
  });
};

export const deactivateAllExcept = async (id: string) => {
  return await prisma.periode.updateMany({
    where: { id: { not: id } },
    data: { isActive: false },
  });
};
