import { Prisma } from "@prisma/client";
import { prisma } from "../../config";
import { IFilterLecturer, LecturerBodyDTO } from "./lecturers.dto";

export const createDosen = async ({
  email,
  isActive,
  lesson,
  name,
  nidn,
  numberPhone,
}: LecturerBodyDTO) => {
  return await prisma.lecturer.create({
    data: {
      email,
      isActive,
      lesson,
      name: name as string,
      nidn: nidn as string,
      numberPhone,
    },
    select: {
      id: true,
      name: true,
    },
  });
};

export const getDosen = async ({ page, perPage, search }: IFilterLecturer) => {
  const filter = {} as { OR: Prisma.LecturerWhereInput[] };

  if (search) {
    filter.OR = [
      {
        email: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        nidn: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

    return await prisma.lecturer.findMany({
    where: filter,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      nidn: true,
      numberPhone: true,
      lesson: true,
      // Cast: field sintaId baru ditambahkan, tapi Prisma Client sudah include
      // setelah prisma generate. Kalau belum ke-generate, cast `as any` di
      // return-nya juga tidak diperlukan karena select ini akan include otomatis.
      sintaId: true,
    } as any,
    take: perPage,
    skip: (Number(page) - 1) * Number(perPage),
  });
};

export const getDosenCount = async ({ search }: IFilterLecturer) => {
  const filter = {} as { OR: Prisma.LecturerWhereInput[] };

  if (search) {
    filter.OR = [
      {
        email: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        nidn: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  return await prisma.lecturer.count({
    where: filter,
  });
};

export const deleteDosen = async (id: string) => {
  return await prisma.lecturer.delete({
    where: {
      id,
    },
  });
};

export const getDosenById = async (id: string) => {
  return await prisma.lecturer.findUnique({
    where: {
      id,
    },
  });
};

export const getDosenByNIDN = async (nidn: string) => {
  return await prisma.lecturer.findMany({
    where: {
      nidn,
    },
  });
};
export const getDosenByEmail = async (email: string) => {
  return await prisma.lecturer.findMany({
    where: {
      email,
    },
  });
};

export const updateDosen = async (data: LecturerBodyDTO) => {
  return await prisma.lecturer.update({
    where: {
      id: data.id,
    },
    data,
  });
};
