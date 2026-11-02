import { prisma } from "../../config";
import { CreateProdiStructuralDTO, UpdateProdiStructuralDTO } from "./prodi-structural.dto";

export const findAllProdiStructural = async () => {
  return await prisma.prodiStructural.findMany({
    orderBy: { sequence: "asc" },
  });
};

export const findProdiStructuralById = async (id: string) => {
  return await prisma.prodiStructural.findUnique({
    where: { id },
  });
};

export const createProdiStructural = async (data: CreateProdiStructuralDTO) => {
  return await prisma.prodiStructural.create({
    data,
  });
};

export const updateProdiStructural = async (id: string, data: UpdateProdiStructuralDTO) => {
  return await prisma.prodiStructural.update({
    where: { id },
    data,
  });
};

export const deleteProdiStructural = async (id: string) => {
  return await prisma.prodiStructural.delete({
    where: { id },
  });
};
