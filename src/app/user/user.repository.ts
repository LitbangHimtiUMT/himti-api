import { Prisma, Role } from "@prisma/client";
import { prisma } from "../../config";
import { ReturnValue } from "../../utils/return-value";
import {
  IFilterUser,
  UpdateUserBodyRequest,
  UserRequestBodyDTO,
} from "./user.dto";
import { Query } from "../../interface/Query";
import { queryPagination } from "../../utils/pagination";

// Search (nama/email/nim) dan filter role HARUS di-AND-kan: kondisi
// search digabung OR di antara mereka sendiri, lalu role menjadi
// syarat tambahan. Sebelumnya role di-push ke array OR yang sama,
// sehingga filter admin + search "budi" mengembalikan semua admin
// plus siapa pun bernama budi.
const buildUserWhere = ({
  search,
  role,
  roles,
}: IFilterUser): Prisma.UserWhereInput => {
  const where: Prisma.UserWhereInput = {};

  if (search) {
    where.OR = [
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        email: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        nim: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  if (roles) {
    const parse = JSON.parse(roles ?? "[]") as Role[];
    if (parse.length) {
      where.AND = {
        role: {
          in: parse,
        },
      };
    }
  } else if (role) {
    where.AND = {
      role,
    };
  }

  return where;
};

export const getUsers = async (query: IFilterUser) => {
  const filter = buildUserWhere(query);

  return await prisma.user.findMany({
    where: filter,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      nim: true,
      role: true,
      isLogin: true,
    },
    ...queryPagination(query),
  });
};

export const getUsersCount = async (query: IFilterUser) => {
  const filter = buildUserWhere(query);

  return await prisma.user.count({
    where: filter,
  });
};

export const getUserByEmail = async (email: string) => {
  return await prisma.user.findFirst({
    where: {
      email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      nim: true,
      memberId: true,
      role: true,
    },
  });
};

export const createUser = async (data: UserRequestBodyDTO) => {
  return await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
    },
    select: {
      id: true,
      name: true,
    },
  });
};

export const updateUser = async (
  userId: string,
  data: UpdateUserBodyRequest
) => {
  return await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      name: ReturnValue<string>(data.name as string),
      email: ReturnValue<string>(data.email as string),
      ...(data.role ? { role: data.role } : {}),
    },
    select: {
      id: true,
    },
  });
};

export const updateUserRole = async (userId: string, role: Role) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });
};

export const getAllUsers = async () => {
  return await prisma.user.findMany();
};

export const getAllUsersCount = async () => {
  return await prisma.user.count();
};

export const getUserPoint = async () => {
  return await prisma.user.findMany({
    where: {
      Member: {
        isNot: null,
      },
    },
    include: {
      Point: true,
      Member: {
        include: {
          Generation: true,
        },
      },
    },
  });
};

export const deleteUser = async (userId: string) => {
  return await prisma.user.delete({
    where: {
      id: userId,
    },
  });
};

export const getUserWithoutMentorRepository = async (query: Query) => {
  const { search } = query;
  return await prisma.user.findMany({
    where: {
      mentor: null,
      name: {
        contains: search,
        mode: "insensitive",
      },
    },
    ...queryPagination(query),
  });
};

export const getUserWithoutMentorCountRepository = async (query: Query) => {
  const { search } = query;
  return await prisma.user.count({
    where: {
      mentor: null,
      name: {
        contains: search,
        mode: "insensitive",
      },
    },
  });
};
