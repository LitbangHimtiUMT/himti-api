import { User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { MESSAGE_CODE } from "../../utils/error-code";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGES } from "../../utils/messages";
import { Meta } from "../../utils/meta";
import { getUserById } from "../authentication/auth.repository";
import {
  IFilterUser,
  UpdateUserBodyRequest,
  UserRequestBodyDTO,
} from "./user.dto";
import { getUsersDTOMapper, userDTOMapper } from "./user.mapper";
import {
  createUser,
  deleteUser,
  getUserByEmail,
  getUsers,
  getUsersCount,
  getUserWithoutMentorCountRepository,
  getUserWithoutMentorRepository,
  updateUser,
  updateUserRole,
} from "./user.repository";
import { Role } from "@prisma/client";
import { Query } from "../../interface/Query";

export const getUsersService = async (query: IFilterUser) => {
  const { page = "1", perPage = "10" } = query;
  const [users, totalData] = await Promise.all([
    getUsers(query),
    getUsersCount(query),
  ]);
  const meta = Meta(Number(page), Number(perPage), totalData);

  return { data: users, meta };
};

export const createUserService = async (body: UserRequestBodyDTO) => {
  const existUser = await getUserByEmail(body.email);
  if (existUser) {
    return new ErrorApp(
      MESSAGES.ERROR.ALREADY.USER,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  const hashPassword = await bcrypt.hash(body.password, 10);

  const user = await createUser({
    ...body,
    role: "ADMIN",
    password: hashPassword,
  });
  return user;
};

export const getUserService = async (userId: string) => {
  const user = await getUserById(userId);

  if (!user) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.USER.ACCOUNT,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  const data = userDTOMapper(user as User);
  return data;
};

export const updateUserService = async (
  userId: string,
  data: UpdateUserBodyRequest
) => {
  const user = await getUserById(userId);
  if (!user) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.USER.ACCOUNT,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  const result = await updateUser(userId, data);
  return result;
};

export const updateUserRoleService = async (userId: string, role: Role) => {
  const user = await getUserById(userId);
  if (!user) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.USER.ACCOUNT,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  const result = await updateUserRole(userId, role);
  return result;
};

export const deleteUserService = async (userId: string) => {
  const user = await getUserById(userId);
  if (!user) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.USER.ACCOUNT,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  const result = await deleteUser(userId);
  return result;
};

export const getUserWithoutMentorService = async (query: Query) => {
  const { page = "1", perPage = "10" } = query;
  const [user, totalData] = await Promise.all([
    getUserWithoutMentorRepository(query),
    getUserWithoutMentorCountRepository(query),
  ]);

  const meta = Meta(Number(page), Number(perPage), totalData);
  return {
    data: getUsersDTOMapper(user as User[]),
    meta,
  };
};
